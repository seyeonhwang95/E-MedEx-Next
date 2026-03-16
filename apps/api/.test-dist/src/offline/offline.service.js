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
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import { TENANT_REPOSITORY_RESOLVER, } from '../tenancy/tenant-repository.port.js';
let OfflineService = class OfflineService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async listSyncSessions(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const syncRepository = await this.tenantRepositoryResolver.getOfflineSyncSessionRepository(tenant);
        const skip = (query.page - 1) * query.pageSize;
        const [items, total] = await syncRepository.findAndCount({
            where: {
                tenantId: tenant.tenantId,
                ...(query.caseId ? { caseId: query.caseId } : {}),
                ...(query.syncState ? { syncState: query.syncState } : {}),
            },
            order: { updatedAt: 'DESC' },
            skip,
            take: query.pageSize,
        });
        return {
            items,
            total,
            page: query.page,
            pageSize: query.pageSize,
        };
    }
    async upsertSyncSession(request, payload) {
        const tenant = getTenantContextFromRequest(request);
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const syncRepository = await this.tenantRepositoryResolver.getOfflineSyncSessionRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: payload.caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found for sync session: ${payload.caseId}`);
        }
        const existing = (await syncRepository.findOne({
            where: {
                tenantId: tenant.tenantId,
                caseId: payload.caseId,
                deviceId: payload.deviceId,
            },
        }));
        return syncRepository.save(syncRepository.create({
            ...(existing ?? {}),
            tenantId: tenant.tenantId,
            userId: payload.userId,
            deviceId: payload.deviceId,
            caseId: payload.caseId,
            syncState: payload.syncState,
            lastErrorCode: payload.lastErrorCode ?? null,
            lastErrorMessage: payload.lastErrorMessage ?? null,
            lastSyncedAt: payload.lastSyncedAt ? new Date(payload.lastSyncedAt) : payload.syncState === 'Synced' ? new Date() : null,
        }));
    }
    async ingestOfflineAuditEvents(request, payload) {
        const tenant = getTenantContextFromRequest(request);
        const auditRepository = await this.tenantRepositoryResolver.getOfflineAuditEventRepository(tenant);
        const saved = await Promise.all(payload.events.map((event) => auditRepository.save(auditRepository.create({
            tenantId: tenant.tenantId,
            userId: event.userId,
            deviceId: event.deviceId,
            eventType: event.eventType,
            eventPayload: event.eventPayload,
            eventAt: new Date(event.eventAt),
        }))));
        return {
            ingested: saved.length,
        };
    }
};
OfflineService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], OfflineService);
export { OfflineService };
