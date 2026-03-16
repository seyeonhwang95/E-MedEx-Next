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
import { Inject, Injectable } from '@nestjs/common';
import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import { TENANT_REPOSITORY_RESOLVER, } from '../tenancy/tenant-repository.port.js';
let ReferenceService = class ReferenceService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async listAgencies(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const referenceAgencyRepository = await this.tenantRepositoryResolver.getReferenceAgencyRepository(tenant);
        const skip = (query.page - 1) * query.pageSize;
        const [items, total] = await referenceAgencyRepository.findAndCount({
            where: {
                tenantId: tenant.tenantId,
                ...(query.agencyType ? { agencyType: query.agencyType } : {}),
            },
            order: { createdAt: 'DESC' },
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
    async createAgency(request, payload) {
        const tenant = getTenantContextFromRequest(request);
        const referenceAgencyRepository = await this.tenantRepositoryResolver.getReferenceAgencyRepository(tenant);
        return referenceAgencyRepository.save(referenceAgencyRepository.create({
            tenantId: tenant.tenantId,
            agencyName: payload.agencyName,
            agencyType: payload.agencyType ?? null,
            phone: payload.phone ?? null,
            fax: payload.fax ?? null,
            address: payload.address ?? null,
        }));
    }
    async listCaseTypes(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const referenceCaseTypeRepository = await this.tenantRepositoryResolver.getReferenceCaseTypeRepository(tenant);
        const skip = (query.page - 1) * query.pageSize;
        const [items, total] = await referenceCaseTypeRepository.findAndCount({
            where: {
                tenantId: tenant.tenantId,
                ...(query.caseTypeCode ? { caseTypeCode: query.caseTypeCode } : {}),
            },
            order: { createdAt: 'DESC' },
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
    async createCaseType(request, payload) {
        const tenant = getTenantContextFromRequest(request);
        const referenceCaseTypeRepository = await this.tenantRepositoryResolver.getReferenceCaseTypeRepository(tenant);
        return referenceCaseTypeRepository.save(referenceCaseTypeRepository.create({
            tenantId: tenant.tenantId,
            caseTypeCode: payload.caseTypeCode,
            description: payload.description ?? null,
        }));
    }
};
ReferenceService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], ReferenceService);
export { ReferenceService };
