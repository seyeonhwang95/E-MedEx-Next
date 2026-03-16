var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { roles } from '../auth/roles.js';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import { TENANT_REPOSITORY_RESOLVER, } from '../tenancy/tenant-repository.port.js';
let PoliceHoldsService = class PoliceHoldsService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async getPoliceHoldByCaseId(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const policeHoldRepository = await this.tenantRepositoryResolver.getPoliceHoldRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found: ${caseId}`);
        }
        const holdRecord = (await policeHoldRepository.findOne({
            where: { caseId, tenantId: tenant.tenantId },
        }));
        await this.writeAuditEvent(request, {
            eventType: 'police_hold_read',
            targetType: 'case',
            targetId: caseId,
            beforeState: holdRecord,
            afterState: holdRecord,
        });
        return holdRecord;
    }
    async upsertPoliceHold(request, caseId, payload) {
        const tenant = getTenantContextFromRequest(request);
        const principal = getAuthPrincipalFromRequest(request);
        this.assertPoliceHoldPermissions(principal.roles);
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const policeHoldRepository = await this.tenantRepositoryResolver.getPoliceHoldRepository(tenant);
        const caseRecord = (await caseRepository.findOne({
            where: { id: caseId, tenantId: tenant.tenantId },
        }));
        if (!caseRecord) {
            throw new NotFoundException(`Case not found: ${caseId}`);
        }
        const existing = (await policeHoldRepository.findOne({
            where: { caseId, tenantId: tenant.tenantId },
        }));
        const upserted = await policeHoldRepository.save(policeHoldRepository.create({
            ...(existing ?? {}),
            tenantId: tenant.tenantId,
            caseId,
            held: payload.held,
            requestedBy: payload.requestedBy ?? existing?.requestedBy ?? null,
            requestedAt: payload.requestedAt ? new Date(payload.requestedAt) : existing?.requestedAt ?? null,
            releasedBy: payload.releasedBy ?? existing?.releasedBy ?? null,
            releasedAt: payload.releasedAt ? new Date(payload.releasedAt) : existing?.releasedAt ?? null,
            note: payload.note ?? existing?.note ?? null,
        }));
        caseRecord.policeHold = payload.held;
        await caseRepository.save(caseRecord);
        await this.writeAuditEvent(request, {
            eventType: 'police_hold_upsert',
            targetType: 'case',
            targetId: caseId,
            beforeState: existing,
            afterState: upserted,
        });
        return upserted;
    }
    assertPoliceHoldPermissions(userRoles) {
        const allowed = userRoles.includes(roles.Investigator) || userRoles.includes(roles.Pathologist) || userRoles.includes(roles.TenantAdmin);
        if (!allowed) {
            throw new ForbiddenException('Only investigator, pathologist, or tenant admin may update police hold');
        }
    }
    async writeAuditEvent(request, input) {
        const tenant = getTenantContextFromRequest(request);
        const principal = getAuthPrincipalFromRequest(request);
        const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
        const ipAddress = request.ip ?? request.socket.remoteAddress ?? null;
        await auditRepository.save(auditRepository.create({
            tenantId: tenant.tenantId,
            actorSubject: principal.subject,
            actorRoles: principal.roles,
            deviceId: principal.claims.device_id ? String(principal.claims.device_id) : null,
            ipAddress,
            eventType: input.eventType,
            targetType: input.targetType,
            targetId: input.targetId,
            beforeState: input.beforeState,
            afterState: input.afterState,
        }));
    }
};
PoliceHoldsService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], PoliceHoldsService);
export { PoliceHoldsService };
