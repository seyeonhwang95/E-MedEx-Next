import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { SignJWT } from 'jose';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { RolesGuard } from '../src/auth/roles.guard.js';
import { CasesController } from '../src/cases/cases.controller.js';
import { CasesService } from '../src/cases/cases.service.js';
import { OfflineGrantsController } from '../src/control-plane/offline-grants.controller.js';
import { OfflineGrantsService } from '../src/control-plane/offline-grants.service.js';
import { HealthController } from '../src/health/health.controller.js';
async function signDevToken(input) {
    const secret = new TextEncoder().encode(process.env.DEV_JWT_SECRET ?? 'dev-local-secret-change-me');
    return new SignJWT({
        roles: input.roles,
        tenant_id: input.tenantId ?? 'demo',
        ...(input.deviceId ? { device_id: input.deviceId } : {}),
        ...(input.extraClaims ?? {}),
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer(process.env.DEV_JWT_ISSUER ?? 'emedex-dev')
        .setAudience(process.env.DEV_JWT_AUDIENCE ?? 'emedex-api')
        .setSubject(input.subject ?? 'integration-user')
        .setIssuedAt(1_700_000_000)
        .setExpirationTime(4_102_444_800)
        .sign(secret);
}
describe('Auth and RBAC integration', () => {
    let app;
    before(async () => {
        process.env.AUTH_MODE = 'dev';
        process.env.DEV_JWT_SECRET = 'dev-local-secret-change-me';
        process.env.DEV_JWT_ISSUER = 'emedex-dev';
        process.env.DEV_JWT_AUDIENCE = 'emedex-api';
        const testingModule = await Test.createTestingModule({
            controllers: [CasesController, HealthController, OfflineGrantsController],
            providers: [
                {
                    provide: CasesService,
                    useValue: {
                        listCases: async () => ({ items: [], page: 1, pageSize: 50, total: 0 }),
                        getCaseById: async () => null,
                        createCase: async () => null,
                        updateCaseStatus: async () => null,
                    },
                },
                {
                    provide: OfflineGrantsService,
                    useValue: {
                        listOfflineGrants: async () => [],
                        listOfflineGrantAuditEvents: async () => ({ items: [], page: 1, pageSize: 50, total: 0 }),
                        enrollOfflineGrant: async () => ({}),
                        validateOfflineGrant: async () => ({ valid: true, reason: 'OK', wipeRequired: false, grant: null }),
                        acknowledgeOfflineGrantWipe: async () => ({ acknowledged: true, reason: 'OK', grant: null }),
                        revokeOfflineGrant: async () => ({}),
                    },
                },
                Reflector,
                JwtAuthGuard,
                RolesGuard,
                {
                    provide: APP_GUARD,
                    useClass: JwtAuthGuard,
                },
                {
                    provide: APP_GUARD,
                    useClass: RolesGuard,
                },
            ],
        }).compile();
        app = testingModule.createNestApplication();
        await app.init();
    });
    after(async () => {
        await app.close();
    });
    it('rejects missing bearer token on protected route', async () => {
        const response = await request(app.getHttpServer()).get('/cases');
        assert.equal(response.status, 401);
    });
    it('rejects malformed bearer token on protected route', async () => {
        const response = await request(app.getHttpServer())
            .get('/cases')
            .set('Authorization', 'Bearer not-a-valid-token');
        assert.equal(response.status, 401);
    });
    it('rejects valid token with insufficient roles', async () => {
        const token = await signDevToken({ roles: ['investigator'] });
        const response = await request(app.getHttpServer()).get('/cases').set('Authorization', `Bearer ${token}`);
        assert.equal(response.status, 403);
    });
    it('allows valid token with required roles', async () => {
        const token = await signDevToken({ roles: ['investigator', 'tenant_admin'] });
        const response = await request(app.getHttpServer()).get('/cases').set('Authorization', `Bearer ${token}`);
        assert.equal(response.status, 200);
        assert.deepEqual(response.body, {
            items: [],
            page: 1,
            pageSize: 50,
            total: 0,
        });
    });
    it('allows public health route without token', async () => {
        const response = await request(app.getHttpServer()).get('/health');
        assert.equal(response.status, 200);
        assert.equal(response.body.status, 'ok');
    });
    it('allows platform admin to validate offline grants', async () => {
        const token = await signDevToken({ roles: ['platform_admin'], subject: 'admin-user' });
        const response = await request(app.getHttpServer())
            .post('/control/offline-grants/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({
            grantId: 'grant-1',
            tenantId: 'demo',
            userId: 'field-user-1',
            deviceId: 'device-1',
        });
        assert.equal(response.status, 201);
    });
    it('allows tenant-scoped device token to validate its own grant', async () => {
        const token = await signDevToken({
            roles: ['field_intake'],
            subject: 'field-user-1',
            tenantId: 'demo',
            deviceId: 'device-1',
        });
        const response = await request(app.getHttpServer())
            .post('/control/offline-grants/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({
            grantId: 'grant-2',
            tenantId: 'demo',
            userId: 'field-user-1',
            deviceId: 'device-1',
        });
        assert.equal(response.status, 201);
    });
    it('rejects device token when device claim does not match request', async () => {
        const token = await signDevToken({
            roles: ['field_intake'],
            subject: 'field-user-1',
            tenantId: 'demo',
            deviceId: 'device-wrong',
        });
        const response = await request(app.getHttpServer())
            .post('/control/offline-grants/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({
            grantId: 'grant-3',
            tenantId: 'demo',
            userId: 'field-user-1',
            deviceId: 'device-1',
        });
        assert.equal(response.status, 403);
    });
    it('allows tenant-scoped device token to acknowledge wipe for its own grant', async () => {
        const token = await signDevToken({
            roles: ['field_intake'],
            subject: 'field-user-1',
            tenantId: 'demo',
            deviceId: 'device-1',
        });
        const response = await request(app.getHttpServer())
            .post('/control/offline-grants/ack-wipe')
            .set('Authorization', `Bearer ${token}`)
            .send({
            grantId: 'grant-4',
            tenantId: 'demo',
            userId: 'field-user-1',
            deviceId: 'device-1',
        });
        assert.equal(response.status, 201);
    });
    it('rejects device token when tenant claim does not match wipe ack request', async () => {
        const token = await signDevToken({
            roles: ['field_intake'],
            subject: 'field-user-1',
            tenantId: 'demo',
            deviceId: 'device-1',
        });
        const response = await request(app.getHttpServer())
            .post('/control/offline-grants/ack-wipe')
            .set('Authorization', `Bearer ${token}`)
            .send({
            grantId: 'grant-5',
            tenantId: 'other-tenant',
            userId: 'field-user-1',
            deviceId: 'device-1',
        });
        assert.equal(response.status, 403);
    });
    it('allows platform admin to list offline grant audit events', async () => {
        const token = await signDevToken({ roles: ['platform_admin'], subject: 'admin-user' });
        const response = await request(app.getHttpServer())
            .get('/control/offline-grants/grant-6/audit-events?tenantId=demo&page=1&pageSize=20')
            .set('Authorization', `Bearer ${token}`);
        assert.equal(response.status, 200);
    });
});
