import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import { ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OfflineGrantsController } from '../src/control-plane/offline-grants.controller.js';
import { OfflineGrantsService } from '../src/control-plane/offline-grants.service.js';
import { apiErrorCodes } from '../src/common/api-error-codes.js';
import { OfflineDeviceGrantEntity } from '../src/persistence/entities/control-plane.entity.js';
import { TENANT_REPOSITORY_RESOLVER } from '../src/tenancy/tenant-repository.port.js';
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
            eventAt: input.eventAt ?? now,
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
        if (options?.take) {
            items = items.slice(0, options.take);
        }
        return items;
    }
    async findAndCount(options) {
        let items = await this.find({
            where: options?.where,
            order: options?.order,
        });
        const total = items.length;
        const skip = options?.skip ?? 0;
        const take = options?.take ?? items.length;
        items = items.slice(skip, skip + take);
        return [items, total];
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
describe('Control-plane offline grant lifecycle integration', () => {
    let app;
    const offlineGrantStore = [];
    const auditEventStore = [];
    before(async () => {
        const testingModule = await Test.createTestingModule({
            controllers: [OfflineGrantsController],
            providers: [
                OfflineGrantsService,
                {
                    provide: getRepositoryToken(OfflineDeviceGrantEntity),
                    useValue: new InMemoryRepository(offlineGrantStore),
                },
                {
                    provide: TENANT_REPOSITORY_RESOLVER,
                    useValue: {
                        getAuditEventRepository: async () => new InMemoryRepository(auditEventStore),
                    },
                },
            ],
        }).compile();
        app = testingModule.createNestApplication();
        app.use((req, _res, next) => {
            const requestWithAuth = req;
            requestWithAuth.auth = {
                subject: 'platform-admin',
                tenantId: 'demo',
                roles: ['platform_admin'],
                claims: { device_id: 'device-d' },
            };
            requestWithAuth.tenant = {
                tenantId: String(req.body?.tenantId ?? 'demo').toLowerCase(),
                subdomain: 'demo',
                tenantDbName: 'emedex_demo',
                tenantDbSecretRef: null,
                storagePrefix: 'emedex-media/demo',
                searchPrefix: 'emedex-demo',
            };
            next();
        });
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
    it('enrolls an offline grant and validates as active', async () => {
        const enrollResponse = await request(app.getHttpServer()).post('/control/offline-grants/enroll').send({
            tenantId: 'DEMO',
            userId: 'field-user-1',
            deviceId: 'device-a',
            ttlHours: 24,
            issuedBy: 'platform-admin',
        });
        assert.equal(enrollResponse.status, 201);
        assert.equal(enrollResponse.body.tenantId, 'demo');
        assert.equal(enrollResponse.body.status, 'active');
        const enrolledAuditEvent = auditEventStore[auditEventStore.length - 1];
        assert.equal(enrolledAuditEvent.eventType, 'offline_grant_enrolled');
        assert.equal(enrolledAuditEvent.targetType, 'offline_grant');
        assert.equal(enrolledAuditEvent.targetId, enrollResponse.body.grantId);
        assert.equal(enrolledAuditEvent.actorSubject, 'platform-admin');
        const validateResponse = await request(app.getHttpServer()).post('/control/offline-grants/validate').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-1',
            deviceId: 'device-a',
        });
        assert.equal(validateResponse.status, 201);
        assert.equal(validateResponse.body.valid, true);
        assert.equal(validateResponse.body.reason, 'OK');
        assert.equal(validateResponse.body.wipeRequired, false);
        const validatedAuditEvent = auditEventStore[auditEventStore.length - 1];
        assert.equal(validatedAuditEvent.eventType, 'offline_grant_validated');
        assert.equal(validatedAuditEvent.targetType, 'offline_grant');
        assert.equal(validatedAuditEvent.targetId, enrollResponse.body.grantId);
        assert.equal(validatedAuditEvent.actorSubject, 'platform-admin');
    });
    it('revokes a grant and returns wipe-required on validation', async () => {
        const enrollResponse = await request(app.getHttpServer()).post('/control/offline-grants/enroll').send({
            tenantId: 'demo',
            userId: 'field-user-2',
            deviceId: 'device-b',
        });
        const revokeResponse = await request(app.getHttpServer()).post('/control/offline-grants/revoke').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-2',
            deviceId: 'device-b',
            revokedBy: 'platform-admin',
        });
        assert.equal(revokeResponse.status, 201);
        assert.equal(revokeResponse.body.status, 'revoked');
        assert.equal(revokeResponse.body.wipeRequired, true);
        const revokedAuditEvent = auditEventStore[auditEventStore.length - 1];
        assert.equal(revokedAuditEvent.eventType, 'offline_grant_revoked');
        assert.equal(revokedAuditEvent.targetType, 'offline_grant');
        assert.equal(revokedAuditEvent.targetId, enrollResponse.body.grantId);
        assert.equal(revokedAuditEvent.actorSubject, 'platform-admin');
        const validateResponse = await request(app.getHttpServer()).post('/control/offline-grants/validate').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-2',
            deviceId: 'device-b',
        });
        assert.equal(validateResponse.status, 201);
        assert.equal(validateResponse.body.valid, false);
        assert.equal(validateResponse.body.reason, 'REVOKED');
        assert.equal(validateResponse.body.wipeRequired, true);
    });
    it('marks expired grant as invalid and persists expired status', async () => {
        const enrollResponse = await request(app.getHttpServer()).post('/control/offline-grants/enroll').send({
            tenantId: 'demo',
            userId: 'field-user-3',
            deviceId: 'device-c',
            ttlHours: 1,
        });
        const storedGrant = offlineGrantStore.find((item) => item.grantId === enrollResponse.body.grantId);
        assert.ok(storedGrant);
        storedGrant.expiresAt = new Date(Date.now() - 60_000);
        const validateResponse = await request(app.getHttpServer()).post('/control/offline-grants/validate').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-3',
            deviceId: 'device-c',
        });
        assert.equal(validateResponse.status, 201);
        assert.equal(validateResponse.body.valid, false);
        assert.equal(validateResponse.body.reason, 'EXPIRED');
        assert.equal(validateResponse.body.grant.status, 'expired');
    });
    it('acknowledges wipe and clears wipeRequired for revoked grant', async () => {
        const enrollResponse = await request(app.getHttpServer()).post('/control/offline-grants/enroll').send({
            tenantId: 'demo',
            userId: 'field-user-4',
            deviceId: 'device-d',
        });
        await request(app.getHttpServer()).post('/control/offline-grants/revoke').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-4',
            deviceId: 'device-d',
            revokedBy: 'platform-admin',
        });
        const ackResponse = await request(app.getHttpServer()).post('/control/offline-grants/ack-wipe').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-4',
            deviceId: 'device-d',
        });
        assert.equal(ackResponse.status, 201);
        assert.equal(ackResponse.body.acknowledged, true);
        assert.equal(ackResponse.body.reason, 'OK');
        assert.equal(ackResponse.body.grant.wipeRequired, false);
        const latestAuditEvent = auditEventStore[auditEventStore.length - 1];
        assert.equal(latestAuditEvent.eventType, 'offline_grant_wipe_acknowledged');
        assert.equal(latestAuditEvent.targetType, 'offline_grant');
        assert.equal(latestAuditEvent.targetId, enrollResponse.body.grantId);
        assert.equal(latestAuditEvent.actorSubject, 'platform-admin');
        assert.equal(latestAuditEvent.tenantId, 'demo');
        const validateResponse = await request(app.getHttpServer()).post('/control/offline-grants/validate').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-4',
            deviceId: 'device-d',
        });
        assert.equal(validateResponse.status, 201);
        assert.equal(validateResponse.body.reason, 'REVOKED');
        assert.equal(validateResponse.body.wipeRequired, false);
    });
    it('returns NOT_FOUND when ack-wipe grant does not exist', async () => {
        const ackResponse = await request(app.getHttpServer()).post('/control/offline-grants/ack-wipe').send({
            grantId: 'missing-grant-id',
            tenantId: 'demo',
            userId: 'field-user-missing',
            deviceId: 'device-missing',
        });
        assert.equal(ackResponse.status, 201);
        assert.equal(ackResponse.body.acknowledged, false);
        assert.equal(ackResponse.body.reason, 'NOT_FOUND');
        assert.equal(ackResponse.body.grant, null);
    });
    it('returns NOT_REVOKED when ack-wipe is called for active grant', async () => {
        const enrollResponse = await request(app.getHttpServer()).post('/control/offline-grants/enroll').send({
            tenantId: 'demo',
            userId: 'field-user-5',
            deviceId: 'device-e',
        });
        const ackResponse = await request(app.getHttpServer()).post('/control/offline-grants/ack-wipe').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-5',
            deviceId: 'device-e',
        });
        assert.equal(ackResponse.status, 201);
        assert.equal(ackResponse.body.acknowledged, false);
        assert.equal(ackResponse.body.reason, 'NOT_REVOKED');
        assert.equal(ackResponse.body.grant.status, 'active');
        assert.equal(ackResponse.body.grant.wipeRequired, false);
    });
    it('lists offline grant audit events for a grant and tenant', async () => {
        const enrollResponse = await request(app.getHttpServer()).post('/control/offline-grants/enroll').send({
            tenantId: 'demo',
            userId: 'field-user-6',
            deviceId: 'device-f',
        });
        await request(app.getHttpServer()).post('/control/offline-grants/validate').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-6',
            deviceId: 'device-f',
        });
        await request(app.getHttpServer()).post('/control/offline-grants/revoke').send({
            grantId: enrollResponse.body.grantId,
            tenantId: 'demo',
            userId: 'field-user-6',
            deviceId: 'device-f',
            revokedBy: 'platform-admin',
        });
        const auditListResponse = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&page=1&pageSize=20`);
        assert.equal(auditListResponse.status, 200);
        assert.equal(Array.isArray(auditListResponse.body.items), true);
        assert.equal(auditListResponse.body.total >= 3, true);
        const eventTypes = auditListResponse.body.items.map((item) => item.eventType);
        assert.equal(eventTypes.includes('offline_grant_enrolled'), true);
        assert.equal(eventTypes.includes('offline_grant_validated'), true);
        assert.equal(eventTypes.includes('offline_grant_revoked'), true);
        const filteredAuditListResponse = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&eventType=offline_grant_validated&page=1&pageSize=20`);
        assert.equal(filteredAuditListResponse.status, 200);
        assert.equal(filteredAuditListResponse.body.total >= 1, true);
        const filteredEventTypes = filteredAuditListResponse.body.items.map((item) => item.eventType);
        assert.equal(filteredEventTypes.every((eventType) => eventType === 'offline_grant_validated'), true);
        const enrolledAudit = auditEventStore.find((item) => item.targetId === enrollResponse.body.grantId && item.eventType === 'offline_grant_enrolled');
        const validatedAudit = auditEventStore.find((item) => item.targetId === enrollResponse.body.grantId && item.eventType === 'offline_grant_validated');
        const revokedAudit = auditEventStore.find((item) => item.targetId === enrollResponse.body.grantId && item.eventType === 'offline_grant_revoked');
        assert.ok(enrolledAudit);
        assert.ok(validatedAudit);
        assert.ok(revokedAudit);
        enrolledAudit.eventAt = new Date('2026-03-16T09:00:00.000Z');
        validatedAudit.eventAt = new Date('2026-03-16T10:00:00.000Z');
        revokedAudit.eventAt = new Date('2026-03-16T11:00:00.000Z');
        const timeWindowResponse = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&from=2026-03-16T09:30:00.000Z&to=2026-03-16T10:30:00.000Z&page=1&pageSize=20`);
        assert.equal(timeWindowResponse.status, 200);
        assert.equal(timeWindowResponse.body.total, 1);
        assert.equal(timeWindowResponse.body.items[0].eventType, 'offline_grant_validated');
        const sortedAscendingResponse = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&from=2026-03-16T08:30:00.000Z&to=2026-03-16T11:30:00.000Z&sort=eventAt:asc&page=1&pageSize=20`);
        assert.equal(sortedAscendingResponse.status, 200);
        const sortedEventTypes = sortedAscendingResponse.body.items.map((item) => item.eventType);
        assert.deepEqual(sortedEventTypes.slice(0, 3), [
            'offline_grant_enrolled',
            'offline_grant_validated',
            'offline_grant_revoked',
        ]);
        const firstCursorPage = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&sort=eventAt:desc&pageSize=2&cursor=`);
        assert.equal(firstCursorPage.status, 200);
        assert.equal(firstCursorPage.body.items.length, 2);
        assert.ok(firstCursorPage.body.nextCursor);
        const secondCursorPage = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&sort=eventAt:desc&pageSize=2&cursor=${encodeURIComponent(String(firstCursorPage.body.nextCursor))}`);
        assert.equal(secondCursorPage.status, 200);
        assert.equal(secondCursorPage.body.items.length >= 1, true);
        const firstPageIds = firstCursorPage.body.items.map((item) => item.id);
        const secondPageIds = secondCursorPage.body.items.map((item) => item.id);
        const overlap = secondPageIds.some((id) => firstPageIds.includes(id));
        assert.equal(overlap, false);
        const malformedCursorResponse = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&sort=eventAt:desc&pageSize=20&cursor=not-a-valid-cursor`);
        assert.equal(malformedCursorResponse.status, 400);
        assert.equal(malformedCursorResponse.body.code, apiErrorCodes.InvalidCursor);
        const staleCursor = Buffer.from(JSON.stringify({ id: 'missing-audit-id', eventAt: '2026-03-16T10:00:00.000Z' }), 'utf8').toString('base64url');
        const staleCursorResponse = await request(app.getHttpServer()).get(`/control/offline-grants/${enrollResponse.body.grantId}/audit-events?tenantId=demo&sort=eventAt:desc&pageSize=20&cursor=${encodeURIComponent(staleCursor)}`);
        assert.equal(staleCursorResponse.status, 400);
        assert.equal(staleCursorResponse.body.code, apiErrorCodes.InvalidCursor);
    });
});
