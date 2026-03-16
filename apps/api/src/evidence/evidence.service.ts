import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { CreateCustodyEventDto } from './dto/create-custody-event.dto.js';
import type { CreateEvidenceItemDto } from './dto/create-evidence-item.dto.js';
import type { ListEvidenceQueryDto } from './dto/list-evidence-query.dto.js';

@Injectable()
export class EvidenceService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async listEvidenceItems(request: Request, query: ListEvidenceQueryDto) {
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

  async getEvidenceByBarcode(request: Request, barcode: string) {
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

  async createEvidenceItem(request: Request, payload: CreateEvidenceItemDto) {
    const tenant = getTenantContextFromRequest(request);
    const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
    const evidenceRepository = await this.tenantRepositoryResolver.getEvidenceItemRepository(tenant);

    const caseRecord = await caseRepository.findOne({
      where: { id: payload.caseId, tenantId: tenant.tenantId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found for evidence: ${payload.caseId}`);
    }

    return evidenceRepository.save(
      evidenceRepository.create({
        tenantId: tenant.tenantId,
        caseId: payload.caseId,
        itemCode: payload.itemCode,
        barcode: payload.barcode ?? null,
        description: payload.description ?? null,
        storageLocation: payload.storageLocation ?? null,
      }),
    );
  }

  async listCustodyEvents(request: Request, evidenceItemId: string) {
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

  async addCustodyEvent(request: Request, evidenceItemId: string, payload: CreateCustodyEventDto) {
    const tenant = getTenantContextFromRequest(request);
    const evidenceRepository = await this.tenantRepositoryResolver.getEvidenceItemRepository(tenant);
    const custodyRepository = await this.tenantRepositoryResolver.getCustodyEventRepository(tenant);

    const evidence = await evidenceRepository.findOne({
      where: { id: evidenceItemId, tenantId: tenant.tenantId },
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence item not found: ${evidenceItemId}`);
    }

    return custodyRepository.save(
      custodyRepository.create({
        tenantId: tenant.tenantId,
        evidenceItemId,
        eventType: payload.eventType,
        actorUserId: payload.actorUserId ?? null,
        fromLocation: payload.fromLocation ?? null,
        toLocation: payload.toLocation ?? null,
        reason: payload.reason ?? null,
        eventAt: new Date(payload.eventAt),
      }),
    );
  }
}