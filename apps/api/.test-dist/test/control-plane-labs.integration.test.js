import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import { ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { apiErrorCodes } from '../src/common/api-error-codes.js';
import { TenantAdminController } from '../src/control-plane/tenant-admin.controller.js';
import { TenantProvisioningService } from '../src/control-plane/tenant-provisioning.service.js';
import { TenantLabEntity, TenantLabRoutingAuditEntity, TenantRegistryEntity, } from '../src/persistence/entities/control-plane.entity.js';
class InMemoryRepository {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    create(input) {
        return {
            ...input,
        };
    }
    async save(input) {
        const existingIndex = this.storage.findIndex((item) => item.id === input.id);
        const now = new Date();
        if (existingIndex >= 0) {
            const updated = {
                ...this.storage[existingIndex],
                ...input,
                updatedAt: now,
            };
            this.storage[existingIndex] = updated;
            return updated;
        }
        const created = {
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            ...input,
        };
        this.storage.push(created);
        return created;
    }
    async find(options) {
        let items = this.storage.filter((item) => this.matchesWhere(item, options?.where));
        const orderEntry = options?.order ? Object.entries(options.order)[0] : undefined;
        if (orderEntry) {
            const [key, direction] = orderEntry;
            items = items.sort((left, right) => {
                const leftValue = String(left[key]);
                const rightValue = String(right[key]);
                return direction === 'DESC' ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
            });
        }
        return items;
    }
    async findOne(options) {
        return this.storage.find((item) => this.matchesWhere(item, options.where)) ?? null;
    }
    matchesWhere(item, where) {
        if (!where) {
            return true;
        }
        return Object.entries(where).every(([key, value]) => item[key] === value);
    }
}
describe('Control-plane lab routing integration', () => {
    let app;
    const tenantStore = [
        {
            id: randomUUID(),
            tenantId: 'demo',
            subdomain: 'demo',
            timezone: 'America/New_York',
            locale: 'en-US',
            status: 'active',
            tenantDbName: 'emedex_demo',
            tenantDbSecretRef: null,
            oktaIssuer: null,
            oktaAudience: null,
            createdAt: new Date(),
        },
    ];
    const labStore = [];
    const routingAuditStore = [];
    before(async () => {
        const testingModule = await Test.createTestingModule({
            controllers: [TenantAdminController],
            providers: [
                TenantProvisioningService,
                {
                    provide: getRepositoryToken(TenantRegistryEntity),
                    useValue: new InMemoryRepository(tenantStore),
                },
                {
                    provide: getRepositoryToken(TenantLabEntity),
                    useValue: new InMemoryRepository(labStore),
                },
                {
                    provide: getRepositoryToken(TenantLabRoutingAuditEntity),
                    useValue: new InMemoryRepository(routingAuditStore),
                },
            ],
        }).compile();
        app = testingModule.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }));
        await app.init();
    });
    after(async () => {
        await app.close();
    });
    it('upserts tenant labs and increments config version', async () => {
        const createLab = await request(app.getHttpServer()).put('/control/tenants/demo/labs/lab-a').send({
            displayName: 'Primary Toxicology Lab',
            mllpHost: 'lab-a.local',
            mllpPort: 2575,
            isActive: true,
            routingRules: {
                caseTypes: ['TOX'],
                priorityOnly: false,
                priority: 10,
            },
        });
        const updateLab = await request(app.getHttpServer()).put('/control/tenants/demo/labs/lab-a').send({
            displayName: 'Primary Toxicology Lab Updated',
            mllpHost: 'lab-a.local',
            mllpPort: 2575,
            isActive: true,
            routingRules: {
                caseTypes: ['TOX'],
                testTypes: ['Alcohol'],
                priorityOnly: false,
                priority: 20,
            },
        });
        const listLabs = await request(app.getHttpServer()).get('/control/tenants/demo/labs');
        assert.equal(createLab.status, 200);
        assert.equal(updateLab.status, 200);
        assert.equal(createLab.body.configVersion, '1');
        assert.equal(updateLab.body.configVersion, '2');
        assert.equal(updateLab.body.versionNo, 2);
        assert.equal(listLabs.status, 200);
        assert.equal(listLabs.body.length, 1);
        assert.equal(listLabs.body[0].labCode, 'LAB-A');
        assert.equal(listLabs.body[0].displayName, 'Primary Toxicology Lab Updated');
    });
    it('resolves labs by routing rules and supports manual override', async () => {
        await request(app.getHttpServer()).put('/control/tenants/demo/labs/lab-b').send({
            displayName: 'Secondary Lab',
            mllpHost: 'lab-b.local',
            mllpPort: 2576,
            isActive: true,
            routingRules: {
                caseTypes: ['NME'],
                priorityOnly: true,
                priority: 5,
            },
        });
        const autoResolve = await request(app.getHttpServer()).post('/control/tenants/demo/labs/resolve').send({
            caseType: 'TOX',
            testType: 'Alcohol',
            priority: false,
        });
        const overrideResolve = await request(app.getHttpServer()).post('/control/tenants/demo/labs/resolve').send({
            caseType: 'TOX',
            testType: 'Alcohol',
            priority: false,
            overrideLabCode: 'LAB-B',
            overrideReason: 'Manual forensic review requirement',
        });
        assert.equal(autoResolve.status, 201);
        assert.equal(autoResolve.body.selectedLabCode, 'LAB-A');
        assert.equal(autoResolve.body.overrideApplied, false);
        assert.equal(overrideResolve.status, 201);
        assert.equal(overrideResolve.body.selectedLabCode, 'LAB-B');
        assert.equal(overrideResolve.body.overrideApplied, true);
    });
    it('rejects override to inactive or unknown lab', async () => {
        await request(app.getHttpServer()).put('/control/tenants/demo/labs/lab-c').send({
            displayName: 'Inactive Lab',
            mllpHost: 'lab-c.local',
            mllpPort: 2577,
            isActive: false,
            routingRules: {
                caseTypes: ['TOX'],
            },
        });
        const response = await request(app.getHttpServer()).post('/control/tenants/demo/labs/resolve').send({
            caseType: 'TOX',
            overrideLabCode: 'LAB-C',
            overrideReason: 'Should fail because inactive',
        });
        assert.equal(response.status, 400);
        assert.equal(response.body.code, apiErrorCodes.LabOverrideNotAvailable);
    });
});
