import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { apiErrorCodes } from '../common/api-error-codes.js';
import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import type { TenantContext } from '../tenancy/tenant-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { CreateProtocolVersionDto } from './dto/create-protocol-version.dto.js';
import type { UpdateProtocolVersionDto } from './dto/update-protocol-version.dto.js';

type ProtocolVersionRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  versionNo: number;
  status: 'Draft' | 'Review' | 'Final';
  protocolBody: string | null;
  authoredBy: string | null;
  authoredAt: Date | null;
  finalizedAt: Date | null;
  createdAt: Date;
};

@Injectable()
export class ProtocolsService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async listVersions(request: Request, caseId: string) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);
    const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);

    const [items, total] = await protocolRepository.findAndCount({
      where: { tenantId: tenant.tenantId, caseId },
      order: { versionNo: 'DESC' },
      skip: 0,
      take: 200,
    });

    return { items, total };
  }

  async createVersion(request: Request, caseId: string, payload: CreateProtocolVersionDto) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);

    const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
    const [existing] = await protocolRepository.findAndCount({
      where: { tenantId: tenant.tenantId, caseId },
      order: { versionNo: 'DESC' },
      skip: 0,
      take: 1,
    });
    const latest = existing[0] as ProtocolVersionRecord | undefined;
    const nextVersionNo = (latest?.versionNo ?? 0) + 1;

    const created = await protocolRepository.save(
      protocolRepository.create({
        tenantId: tenant.tenantId,
        caseId,
        versionNo: nextVersionNo,
        status: 'Draft',
        protocolBody: payload.protocolBody ?? null,
        authoredBy: payload.authoredBy ?? null,
        authoredAt: new Date(),
        finalizedAt: null,
      }),
    );

    await this.writeAuditEvent(tenant, {
      eventType: 'protocol_version_created',
      targetType: 'protocol_version',
      targetId: String((created as Record<string, unknown>).id),
      beforeState: null,
      afterState: created as Record<string, unknown>,
    });

    return created;
  }

  async updateVersion(request: Request, caseId: string, versionNo: number, payload: UpdateProtocolVersionDto) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);
    const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);

    const existing = (await protocolRepository.findOne({
      where: { tenantId: tenant.tenantId, caseId, versionNo },
    })) as ProtocolVersionRecord | null;

    if (!existing) {
      throw new NotFoundException(`Protocol version not found: case=${caseId}, version=${versionNo}`);
    }

    if (existing.status === 'Final') {
      throw new BadRequestException({
        code: apiErrorCodes.ProtocolFinalImmutableCreateNewVersion,
        message: 'Final protocol version is immutable; create a new version to make changes',
      });
    }

    const updated = await protocolRepository.save(
      protocolRepository.create({
        ...existing,
        protocolBody: payload.protocolBody ?? existing.protocolBody,
        authoredBy: payload.authoredBy ?? existing.authoredBy,
        authoredAt: new Date(),
      }),
    );

    await this.writeAuditEvent(tenant, {
      eventType: 'protocol_version_updated',
      targetType: 'protocol_version',
      targetId: existing.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as Record<string, unknown>,
    });

    return updated;
  }

  async submitForReview(request: Request, caseId: string, versionNo: number) {
    return this.transitionStatus(request, caseId, versionNo, 'Review', 'protocol_version_submitted_for_review');
  }

  async finalizeVersion(request: Request, caseId: string, versionNo: number) {
    const updated = (await this.transitionStatus(
      request,
      caseId,
      versionNo,
      'Final',
      'protocol_version_finalized',
    )) as ProtocolVersionRecord;

    if (!updated.finalizedAt) {
      const tenant = getTenantContextFromRequest(request);
      const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
      return protocolRepository.save(
        protocolRepository.create({
          ...updated,
          finalizedAt: new Date(),
        }),
      );
    }

    return updated;
  }

  private async transitionStatus(
    request: Request,
    caseId: string,
    versionNo: number,
    targetStatus: 'Review' | 'Final',
    eventType: string,
  ) {
    const tenant = getTenantContextFromRequest(request);
    await this.ensureCaseExists(tenant, caseId);
    const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);

    const existing = (await protocolRepository.findOne({
      where: { tenantId: tenant.tenantId, caseId, versionNo },
    })) as ProtocolVersionRecord | null;

    if (!existing) {
      throw new NotFoundException(`Protocol version not found: case=${caseId}, version=${versionNo}`);
    }

    if (existing.status === 'Final') {
      if (targetStatus === 'Final') {
        return existing;
      }

      throw new BadRequestException({
        code: apiErrorCodes.ProtocolFinalImmutable,
        message: 'Final protocol version is immutable',
      });
    }

    const updated = await protocolRepository.save(
      protocolRepository.create({
        ...existing,
        status: targetStatus,
        finalizedAt: targetStatus === 'Final' ? new Date() : existing.finalizedAt,
      }),
    );

    await this.writeAuditEvent(tenant, {
      eventType,
      targetType: 'protocol_version',
      targetId: existing.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as Record<string, unknown>,
    });

    return updated;
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

  private async writeAuditEvent(
    tenant: TenantContext,
    input: {
      eventType: string;
      targetType: string;
      targetId: string;
      beforeState: Record<string, unknown> | null;
      afterState: Record<string, unknown> | null;
    },
  ) {
    const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
    await auditRepository.save(
      auditRepository.create({
        tenantId: tenant.tenantId,
        eventType: input.eventType,
        targetType: input.targetType,
        targetId: input.targetId,
        beforeState: input.beforeState,
        afterState: input.afterState,
      }),
    );
  }
}