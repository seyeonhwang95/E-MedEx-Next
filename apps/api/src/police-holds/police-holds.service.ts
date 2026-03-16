import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { roles } from '../auth/roles.js';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { UpsertPoliceHoldDto } from './dto/upsert-police-hold.dto.js';

type PoliceHoldRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  held: boolean;
  requestedBy: string | null;
  requestedAt: Date | null;
  releasedBy: string | null;
  releasedAt: Date | null;
  note: string | null;
};

@Injectable()
export class PoliceHoldsService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async getPoliceHoldByCaseId(request: Request, caseId: string) {
    const tenant = getTenantContextFromRequest(request);
    const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
    const policeHoldRepository = await this.tenantRepositoryResolver.getPoliceHoldRepository(tenant);

    const caseRecord = await caseRepository.findOne({
      where: { id: caseId, tenantId: tenant.tenantId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found: ${caseId}`);
    }

    const holdRecord = (await policeHoldRepository.findOne({
      where: { caseId, tenantId: tenant.tenantId },
    })) as PoliceHoldRecord | null;

    await this.writeAuditEvent(request, {
      eventType: 'police_hold_read',
      targetType: 'case',
      targetId: caseId,
      beforeState: holdRecord,
      afterState: holdRecord,
    });

    return holdRecord;
  }

  async upsertPoliceHold(request: Request, caseId: string, payload: UpsertPoliceHoldDto) {
    const tenant = getTenantContextFromRequest(request);
    const principal = getAuthPrincipalFromRequest(request);
    this.assertPoliceHoldPermissions(principal.roles);

    const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
    const policeHoldRepository = await this.tenantRepositoryResolver.getPoliceHoldRepository(tenant);

    const caseRecord = (await caseRepository.findOne({
      where: { id: caseId, tenantId: tenant.tenantId },
    })) as Record<string, unknown> | null;

    if (!caseRecord) {
      throw new NotFoundException(`Case not found: ${caseId}`);
    }

    const existing = (await policeHoldRepository.findOne({
      where: { caseId, tenantId: tenant.tenantId },
    })) as PoliceHoldRecord | null;

    const upserted = await policeHoldRepository.save(
      policeHoldRepository.create({
        ...(existing ?? {}),
        tenantId: tenant.tenantId,
        caseId,
        held: payload.held,
        requestedBy: payload.requestedBy ?? existing?.requestedBy ?? null,
        requestedAt: payload.requestedAt ? new Date(payload.requestedAt) : existing?.requestedAt ?? null,
        releasedBy: payload.releasedBy ?? existing?.releasedBy ?? null,
        releasedAt: payload.releasedAt ? new Date(payload.releasedAt) : existing?.releasedAt ?? null,
        note: payload.note ?? existing?.note ?? null,
      }),
    );

    caseRecord.policeHold = payload.held;
    await caseRepository.save(caseRecord);

    await this.writeAuditEvent(request, {
      eventType: 'police_hold_upsert',
      targetType: 'case',
      targetId: caseId,
      beforeState: existing,
      afterState: upserted as Record<string, unknown>,
    });

    return upserted;
  }

  private assertPoliceHoldPermissions(userRoles: string[]) {
    const allowed = userRoles.includes(roles.Investigator) || userRoles.includes(roles.Pathologist) || userRoles.includes(roles.TenantAdmin);
    if (!allowed) {
      throw new ForbiddenException('Only investigator, pathologist, or tenant admin may update police hold');
    }
  }

  private async writeAuditEvent(
    request: Request,
    input: {
      eventType: string;
      targetType: string;
      targetId: string;
      beforeState: Record<string, unknown> | null;
      afterState: Record<string, unknown> | null;
    },
  ) {
    const tenant = getTenantContextFromRequest(request);
    const principal = getAuthPrincipalFromRequest(request);
    const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
    const ipAddress = request.ip ?? request.socket.remoteAddress ?? null;

    await auditRepository.save(
      auditRepository.create({
        tenantId: tenant.tenantId,
        actorSubject: principal.subject,
        actorRoles: principal.roles,
        deviceId: principal.claims.device_id ? String(principal.claims.device_id) : null,
        ipAddress,
        eventType: input.eventType,
        targetType: input.targetType,
        targetId: input.targetId,
        beforeState: input.beforeState,
        afterState: input.afterState,
      }),
    );
  }
}