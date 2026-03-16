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
let InvestigationsService = class InvestigationsService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async getInvestigationByCaseId(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const investigationRepository = await this.tenantRepositoryResolver.getInvestigationRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found: ${caseId}`);
        }
        return investigationRepository.findOne({
            where: { caseId, tenantId: tenant.tenantId },
        });
    }
    async upsertInvestigation(request, caseId, payload) {
        const tenant = getTenantContextFromRequest(request);
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const investigationRepository = await this.tenantRepositoryResolver.getInvestigationRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found: ${caseId}`);
        }
        const existing = (await investigationRepository.findOne({
            where: { caseId, tenantId: tenant.tenantId },
        }));
        const entity = investigationRepository.create({
            ...(existing ?? {}),
            tenantId: tenant.tenantId,
            caseId,
            investigatorUserId: payload.investigatorUserId ?? existing?.investigatorUserId ?? null,
            receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : existing?.receivedAt ?? null,
            incidentAt: payload.incidentAt ? new Date(payload.incidentAt) : existing?.incidentAt ?? null,
            deathAt: payload.deathAt ? new Date(payload.deathAt) : existing?.deathAt ?? null,
            deathLocation: payload.deathLocation ?? existing?.deathLocation ?? null,
            narrative: payload.narrative ?? existing?.narrative ?? null,
        });
        return investigationRepository.save(entity);
    }
};
InvestigationsService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], InvestigationsService);
export { InvestigationsService };
