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
let EvidenceService = class EvidenceService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async listEvidenceItems(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const evidenceRepository = await this.tenantRepositoryResolver.getEvidenceItemRepository(tenant);
        const where = {
            tenantId: tenant.tenantId,
            ...(query.caseId ? { caseId: query.caseId } : {}),
            ...(query.barcode ? { barcode: query.barcode } : {}),
        };
        const skip = (query.page - 1) * query.pageSize;
        const [items, total] = await evidenceRepository.findAndCount({
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
    async getEvidenceByBarcode(request, barcode) {
        const tenant = getTenantContextFromRequest(request);
        const evidenceRepository = await this.tenantRepositoryResolver.getEvidenceItemRepository(tenant);
        const evidence = await evidenceRepository.findOne({
            where: {
                tenantId: tenant.tenantId,
                barcode,
            },
        });
        if (!evidence) {
            throw new NotFoundException(`Evidence not found for barcode: ${barcode}`);
        }
        return evidence;
    }
    async createEvidenceItem(request, payload) {
        const tenant = getTenantContextFromRequest(request);
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const evidenceRepository = await this.tenantRepositoryResolver.getEvidenceItemRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: payload.caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found for evidence: ${payload.caseId}`);
        }
        return evidenceRepository.save(evidenceRepository.create({
            tenantId: tenant.tenantId,
            caseId: payload.caseId,
            itemCode: payload.itemCode,
            barcode: payload.barcode ?? null,
            description: payload.description ?? null,
            storageLocation: payload.storageLocation ?? null,
        }));
    }
    async listCustodyEvents(request, evidenceItemId) {
        const tenant = getTenantContextFromRequest(request);
        const evidenceRepository = await this.tenantRepositoryResolver.getEvidenceItemRepository(tenant);
        const custodyRepository = await this.tenantRepositoryResolver.getCustodyEventRepository(tenant);
        const evidence = await evidenceRepository.findOne({
            where: { id: evidenceItemId, tenantId: tenant.tenantId },
        });
        if (!evidence) {
            throw new NotFoundException(`Evidence item not found: ${evidenceItemId}`);
        }
        const [items, total] = await custodyRepository.findAndCount({
            where: { tenantId: tenant.tenantId, evidenceItemId },
            order: { eventAt: 'DESC' },
            skip: 0,
            take: 500,
        });
        return { items, total };
    }
    async addCustodyEvent(request, evidenceItemId, payload) {
        const tenant = getTenantContextFromRequest(request);
        const evidenceRepository = await this.tenantRepositoryResolver.getEvidenceItemRepository(tenant);
        const custodyRepository = await this.tenantRepositoryResolver.getCustodyEventRepository(tenant);
        const evidence = await evidenceRepository.findOne({
            where: { id: evidenceItemId, tenantId: tenant.tenantId },
        });
        if (!evidence) {
            throw new NotFoundException(`Evidence item not found: ${evidenceItemId}`);
        }
        return custodyRepository.save(custodyRepository.create({
            tenantId: tenant.tenantId,
            evidenceItemId,
            eventType: payload.eventType,
            actorUserId: payload.actorUserId ?? null,
            fromLocation: payload.fromLocation ?? null,
            toLocation: payload.toLocation ?? null,
            reason: payload.reason ?? null,
            eventAt: new Date(payload.eventAt),
        }));
    }
};
EvidenceService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], EvidenceService);
export { EvidenceService };
