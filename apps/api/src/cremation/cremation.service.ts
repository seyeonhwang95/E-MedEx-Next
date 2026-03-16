import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import type { TenantContext } from '../tenancy/tenant-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { UpsertCremationCaseDto } from './dto/upsert-cremation-case.dto.js';

type CremationCaseRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  funeralHomeName: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  indigent: boolean;
  fee: string | null;
};

@Injectable()
export class CremationService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async getByCaseId(request: Request, caseId: string) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);
    const cremationRepository = await this.tenantRepositoryResolver.getCremationCaseRepository(tenant);

    return cremationRepository.findOne({
      where: { tenantId: tenant.tenantId, caseId },
    });
  }

  async upsertByCaseId(request: Request, caseId: string, payload: UpsertCremationCaseDto) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);
    const cremationRepository = await this.tenantRepositoryResolver.getCremationCaseRepository(tenant);

    const existing = (await cremationRepository.findOne({
      where: { tenantId: tenant.tenantId, caseId },
    })) as CremationCaseRecord | null;

    const upserted = await cremationRepository.save(
      cremationRepository.create({
        ...(existing ?? {}),
        tenantId: tenant.tenantId,
        caseId,
        funeralHomeName: payload.funeralHomeName ?? existing?.funeralHomeName ?? null,
        approvedBy: payload.approvedBy ?? existing?.approvedBy ?? null,
        approvedAt: payload.approvedAt ? new Date(payload.approvedAt) : existing?.approvedAt ?? null,
        indigent: payload.indigent ?? existing?.indigent ?? false,
        fee: typeof payload.fee === 'number' ? payload.fee.toFixed(2) : existing?.fee ?? null,
      }),
    );

    const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
    await auditRepository.save(
      auditRepository.create({
        tenantId: tenant.tenantId,
        eventType: 'cremation_case_upsert',
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