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
let CremationService = class CremationService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async getByCaseId(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const cremationRepository = await this.tenantRepositoryResolver.getCremationCaseRepository(tenant);
        return cremationRepository.findOne({
            where: { tenantId: tenant.tenantId, caseId },
        });
    }
    async upsertByCaseId(request, caseId, payload) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const cremationRepository = await this.tenantRepositoryResolver.getCremationCaseRepository(tenant);
        const existing = (await cremationRepository.findOne({
            where: { tenantId: tenant.tenantId, caseId },
        }));
        const upserted = await cremationRepository.save(cremationRepository.create({
            ...(existing ?? {}),
            tenantId: tenant.tenantId,
            caseId,
            funeralHomeName: payload.funeralHomeName ?? existing?.funeralHomeName ?? null,
            approvedBy: payload.approvedBy ?? existing?.approvedBy ?? null,
            approvedAt: payload.approvedAt ? new Date(payload.approvedAt) : existing?.approvedAt ?? null,
            indigent: payload.indigent ?? existing?.indigent ?? false,
            fee: typeof payload.fee === 'number' ? payload.fee.toFixed(2) : existing?.fee ?? null,
        }));
        const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
        await auditRepository.save(auditRepository.create({
            tenantId: tenant.tenantId,
            eventType: 'cremation_case_upsert',
            targetType: 'case',
            targetId: caseId,
            beforeState: existing,
            afterState: upserted,
        }));
        return upserted;
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
};
CremationService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], CremationService);
export { CremationService };
