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
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { apiErrorCodes } from '../common/api-error-codes.js';
import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import { TENANT_REPOSITORY_RESOLVER, } from '../tenancy/tenant-repository.port.js';
let ProtocolsService = class ProtocolsService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async listVersions(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
        const [items, total] = await protocolRepository.findAndCount({
            where: { tenantId: tenant.tenantId, caseId },
            order: { versionNo: 'DESC' },
            skip: 0,
            take: 200,
        });
        return { items, total };
    }
    async createVersion(request, caseId, payload) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
        const [existing] = await protocolRepository.findAndCount({
            where: { tenantId: tenant.tenantId, caseId },
            order: { versionNo: 'DESC' },
            skip: 0,
            take: 1,
        });
        const latest = existing[0];
        const nextVersionNo = (latest?.versionNo ?? 0) + 1;
        const created = await protocolRepository.save(protocolRepository.create({
            tenantId: tenant.tenantId,
            caseId,
            versionNo: nextVersionNo,
            status: 'Draft',
            protocolBody: payload.protocolBody ?? null,
            authoredBy: payload.authoredBy ?? null,
            authoredAt: new Date(),
            finalizedAt: null,
        }));
        await this.writeAuditEvent(tenant, {
            eventType: 'protocol_version_created',
            targetType: 'protocol_version',
            targetId: String(created.id),
            beforeState: null,
            afterState: created,
        });
        return created;
    }
    async updateVersion(request, caseId, versionNo, payload) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
        const existing = (await protocolRepository.findOne({
            where: { tenantId: tenant.tenantId, caseId, versionNo },
        }));
        if (!existing) {
            throw new NotFoundException(`Protocol version not found: case=${caseId}, version=${versionNo}`);
        }
        if (existing.status === 'Final') {
            throw new BadRequestException({
                code: apiErrorCodes.ProtocolFinalImmutableCreateNewVersion,
                message: 'Final protocol version is immutable; create a new version to make changes',
            });
        }
        const updated = await protocolRepository.save(protocolRepository.create({
            ...existing,
            protocolBody: payload.protocolBody ?? existing.protocolBody,
            authoredBy: payload.authoredBy ?? existing.authoredBy,
            authoredAt: new Date(),
        }));
        await this.writeAuditEvent(tenant, {
            eventType: 'protocol_version_updated',
            targetType: 'protocol_version',
            targetId: existing.id,
            beforeState: existing,
            afterState: updated,
        });
        return updated;
    }
    async submitForReview(request, caseId, versionNo) {
        return this.transitionStatus(request, caseId, versionNo, 'Review', 'protocol_version_submitted_for_review');
    }
    async finalizeVersion(request, caseId, versionNo) {
        const updated = (await this.transitionStatus(request, caseId, versionNo, 'Final', 'protocol_version_finalized'));
        if (!updated.finalizedAt) {
            const tenant = getTenantContextFromRequest(request);
            const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
            return protocolRepository.save(protocolRepository.create({
                ...updated,
                finalizedAt: new Date(),
            }));
        }
        return updated;
    }
    async transitionStatus(request, caseId, versionNo, targetStatus, eventType) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
        const existing = (await protocolRepository.findOne({
            where: { tenantId: tenant.tenantId, caseId, versionNo },
        }));
        if (!existing) {
            throw new NotFoundException(`Protocol version not found: case=${caseId}, version=${versionNo}`);
        }
        if (existing.status === 'Final') {
            if (targetStatus === 'Final') {
                return existing;
            }
            throw new BadRequestException({
                code: apiErrorCodes.ProtocolFinalImmutable,
                message: 'Final protocol version is immutable',
            });
        }
        const updated = await protocolRepository.save(protocolRepository.create({
            ...existing,
            status: targetStatus,
            finalizedAt: targetStatus === 'Final' ? new Date() : existing.finalizedAt,
        }));
        await this.writeAuditEvent(tenant, {
            eventType,
            targetType: 'protocol_version',
            targetId: existing.id,
            beforeState: existing,
            afterState: updated,
        });
        return updated;
    }
    async ensureCaseExists(tenant, caseId) {
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found: ${caseId}`);
        }
    }
    async writeAuditEvent(tenant, input) {
        const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
        await auditRepository.save(auditRepository.create({
            tenantId: tenant.tenantId,
            eventType: input.eventType,
            targetType: input.targetType,
            targetId: input.targetId,
            beforeState: input.beforeState,
            afterState: input.afterState,
        }));
    }
};
ProtocolsService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], ProtocolsService);
export { ProtocolsService };
