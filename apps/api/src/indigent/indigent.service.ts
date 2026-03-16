import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import type { TenantContext } from '../tenancy/tenant-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { UpsertIndigentCaseDto } from './dto/upsert-indigent-case.dto.js';

type IndigentCaseRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  referralNotes: string | null;
  dispositionNotes: string | null;
  funding: Record<string, unknown> | null;
};

type InvestigationRecord = {
  narrative: string | null;
};

@Injectable()
export class IndigentService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async getByCaseId(request: Request, caseId: string) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);
    const indigentRepository = await this.tenantRepositoryResolver.getIndigentCaseRepository(tenant);

    return indigentRepository.findOne({
      where: { tenantId: tenant.tenantId, caseId },
    });
  }

  async upsertByCaseId(request: Request, caseId: string, payload: UpsertIndigentCaseDto) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);
    const indigentRepository = await this.tenantRepositoryResolver.getIndigentCaseRepository(tenant);
    const investigationRepository = await this.tenantRepositoryResolver.getInvestigationRepository(tenant);

    const existing = (await indigentRepository.findOne({
      where: { tenantId: tenant.tenantId, caseId },
    })) as IndigentCaseRecord | null;

    const investigation = (await investigationRepository.findOne({
      where: { tenantId: tenant.tenantId, caseId },
    })) as InvestigationRecord | null;

    const derivedDispositionNotes =
      payload.dispositionNotes ?? existing?.dispositionNotes ?? investigation?.narrative ?? null;

    const upserted = await indigentRepository.save(
      indigentRepository.create({
        ...(existing ?? {}),
        tenantId: tenant.tenantId,
        caseId,
        referralNotes: payload.referralNotes ?? existing?.referralNotes ?? null,
        dispositionNotes: derivedDispositionNotes,
        funding: payload.funding ?? existing?.funding ?? null,
      }),
    );

    const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
    await auditRepository.save(
      auditRepository.create({
        tenantId: tenant.tenantId,
        eventType: 'indigent_case_upsert',
        targetType: 'case',
        targetId: caseId,
        beforeState: existing as unknown as Record<string, unknown> | null,
        afterState: upserted as Record<string, unknown>,
      }),
    );

    return upserted;
  }

  private async ensureCaseExists(tenant: TenantContext, caseId: string) {
    const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
    const caseRecord = await caseRepository.findOne({
      where: { id: caseId, tenantId: tenant.tenantId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found: ${caseId}`);
    }
  }
}