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
let CasesService = class CasesService {
    tenantDataSourceResolverService;
    constructor(tenantDataSourceResolverService) {
        this.tenantDataSourceResolverService = tenantDataSourceResolverService;
    }
    async listCases(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
        const where = {
            tenantId: tenant.tenantId,
            ...(query.caseType ? { caseType: query.caseType } : {}),
            ...(query.status ? { status: query.status } : {}),
        };
        const skip = (query.page - 1) * query.pageSize;
        const [items, total] = await repository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: query.pageSize,
        });
        return {
            items,
            page: query.page,
            pageSize: query.pageSize,
            total,
        };
    }
    async getCaseById(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
        const record = await repository.findOne({
            where: { id: caseId, tenantId: tenant.tenantId },
        });
        if (!record) {
            throw new NotFoundException(`Case not found: ${caseId}`);
        }
        return record;
    }
    async createCase(request, payload) {
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
        const entity = repository.create({
            tenantId: tenant.tenantId,
            clientCaseUuid: payload.clientCaseUuid,
            canonicalCaseNumber: null,
            temporaryCaseNumber: payload.temporaryCaseNumber,
            caseType: payload.caseType,
            status: 'Intake',
            policeHold: payload.policeHold ?? false,
            priority: payload.priority ?? false,
            demographics: payload.demographics ?? null,
            intakeSummary: payload.intakeSummary ?? null,
        });
        return repository.save(entity);
    }
    async updateCaseStatus(request, caseId, payload) {
        const record = await this.getCaseById(request, caseId);
        record.status = payload.status;
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
        return repository.save(record);
    }
    async assignCanonicalNumber(request, caseId, payload) {
        const record = await this.getCaseById(request, caseId);
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
        if (record.canonicalCaseNumber) {
            return record;
        }
        const prefix = String(payload.prefix ?? record.caseType ?? 'CASE').toUpperCase();
        const caseYear = payload.caseYear ?? new Date().getUTCFullYear();
        const canonicalCaseNumber = await this.tenantDataSourceResolverService.assignCanonicalCaseNumber(tenant, prefix, caseYear);
        record.canonicalCaseNumber = canonicalCaseNumber;
        return repository.save(record);
    }
};
CasesService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], CasesService);
export { CasesService };
