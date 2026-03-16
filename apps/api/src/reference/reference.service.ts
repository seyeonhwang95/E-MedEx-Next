import { Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { CreateReferenceAgencyDto } from './dto/create-reference-agency.dto.js';
import type { CreateReferenceCaseTypeDto } from './dto/create-reference-case-type.dto.js';
import type { ListReferenceAgenciesQueryDto } from './dto/list-reference-agencies-query.dto.js';
import type { ListReferenceCaseTypesQueryDto } from './dto/list-reference-case-types-query.dto.js';

@Injectable()
export class ReferenceService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async listAgencies(request: Request, query: ListReferenceAgenciesQueryDto) {
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

  async createAgency(request: Request, payload: CreateReferenceAgencyDto) {
    const tenant = getTenantContextFromRequest(request);
    const referenceAgencyRepository = await this.tenantRepositoryResolver.getReferenceAgencyRepository(tenant);

    return referenceAgencyRepository.save(
      referenceAgencyRepository.create({
        tenantId: tenant.tenantId,
        agencyName: payload.agencyName,
        agencyType: payload.agencyType ?? null,
        phone: payload.phone ?? null,
        fax: payload.fax ?? null,
        address: payload.address ?? null,
      }),
    );
  }

  async listCaseTypes(request: Request, query: ListReferenceCaseTypesQueryDto) {
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

  async createCaseType(request: Request, payload: CreateReferenceCaseTypeDto) {
    const tenant = getTenantContextFromRequest(request);
    const referenceCaseTypeRepository = await this.tenantRepositoryResolver.getReferenceCaseTypeRepository(tenant);

    return referenceCaseTypeRepository.save(
      referenceCaseTypeRepository.create({
        tenantId: tenant.tenantId,
        caseTypeCode: payload.caseTypeCode,
        description: payload.description ?? null,
      }),
    );
  }
}