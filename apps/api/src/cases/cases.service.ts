import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { FindOptionsWhere } from 'typeorm';

import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { AssignCanonicalNumberDto } from './dto/assign-canonical-number.dto.js';
import type { CreateCaseDto } from './dto/create-case.dto.js';
import type { ListCasesQueryDto } from './dto/list-cases-query.dto.js';
import type { UpdateCaseStatusDto } from './dto/update-case-status.dto.js';

type CaseRecord = {
  id: string;
  tenantId: string;
  clientCaseUuid: string;
  canonicalCaseNumber: string | null;
  temporaryCaseNumber: string;
  caseType: string;
  status: string;
  policeHold: boolean;
  priority: boolean;
  demographics: Record<string, unknown> | null;
  intakeSummary: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CasesService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantDataSourceResolverService: TenantRepositoryResolverPort,
  ) {}

  async listCases(request: Request, query: ListCasesQueryDto) {
    const tenant = getTenantContextFromRequest(request);
    const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);

    const where: FindOptionsWhere<CaseRecord> = {
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

  async getCaseById(request: Request, caseId: string) {
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

  async createCase(request: Request, payload: CreateCaseDto) {
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

  async updateCaseStatus(request: Request, caseId: string, payload: UpdateCaseStatusDto) {
    const record = await this.getCaseById(request, caseId);
    record.status = payload.status;
    const tenant = getTenantContextFromRequest(request);
    const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);

    return repository.save(record);
  }

  async assignCanonicalNumber(request: Request, caseId: string, payload: AssignCanonicalNumberDto) {
    const record = await this.getCaseById(request, caseId);
    const tenant = getTenantContextFromRequest(request);
    const repository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);

    if (record.canonicalCaseNumber) {
      return record;
    }

    const prefix = String(payload.prefix ?? record.caseType ?? 'CASE').toUpperCase();
    const caseYear = payload.caseYear ?? new Date().getUTCFullYear();
    const canonicalCaseNumber = await this.tenantDataSourceResolverService.assignCanonicalCaseNumber(
      tenant,
      prefix,
      caseYear,
    );

    record.canonicalCaseNumber = canonicalCaseNumber;
    return repository.save(record);
  }
}