import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { UpsertInvestigationDto } from './dto/upsert-investigation.dto.js';

type InvestigationRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  investigatorUserId: string | null;
  receivedAt: Date | null;
  incidentAt: Date | null;
  deathAt: Date | null;
  deathLocation: Record<string, unknown> | null;
  narrative: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class InvestigationsService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async getInvestigationByCaseId(request: Request, caseId: string) {
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

  async upsertInvestigation(request: Request, caseId: string, payload: UpsertInvestigationDto) {
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
    })) as InvestigationRecord | null;

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
}