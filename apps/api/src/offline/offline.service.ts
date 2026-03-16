import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { IngestOfflineAuditEventsDto } from './dto/ingest-offline-audit-events.dto.js';
import type { ListSyncSessionsQueryDto } from './dto/list-sync-sessions-query.dto.js';
import type { UpsertSyncSessionDto } from './dto/upsert-sync-session.dto.js';

type SyncSessionRecord = {
  id: string;
  tenantId: string;
  userId: string;
  deviceId: string;
  caseId: string;
  syncState: 'LocalOnly' | 'Queued' | 'Syncing' | 'Synced' | 'Error';
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  lastSyncedAt: Date | null;
};

@Injectable()
export class OfflineService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async listSyncSessions(request: Request, query: ListSyncSessionsQueryDto) {
    const tenant = getTenantContextFromRequest(request);
    const syncRepository = await this.tenantRepositoryResolver.getOfflineSyncSessionRepository(tenant);
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await syncRepository.findAndCount({
      where: {
        tenantId: tenant.tenantId,
        ...(query.caseId ? { caseId: query.caseId } : {}),
        ...(query.syncState ? { syncState: query.syncState } : {}),
      },
      order: { updatedAt: 'DESC' },
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

  async upsertSyncSession(request: Request, payload: UpsertSyncSessionDto) {
    const tenant = getTenantContextFromRequest(request);
    const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
    const syncRepository = await this.tenantRepositoryResolver.getOfflineSyncSessionRepository(tenant);

    const caseRecord = await caseRepository.findOne({
      where: { id: payload.caseId, tenantId: tenant.tenantId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found for sync session: ${payload.caseId}`);
    }

    const existing = (await syncRepository.findOne({
      where: {
        tenantId: tenant.tenantId,
        caseId: payload.caseId,
        deviceId: payload.deviceId,
      },
    })) as SyncSessionRecord | null;

    return syncRepository.save(
      syncRepository.create({
        ...(existing ?? {}),
        tenantId: tenant.tenantId,
        userId: payload.userId,
        deviceId: payload.deviceId,
        caseId: payload.caseId,
        syncState: payload.syncState,
        lastErrorCode: payload.lastErrorCode ?? null,
        lastErrorMessage: payload.lastErrorMessage ?? null,
        lastSyncedAt: payload.lastSyncedAt ? new Date(payload.lastSyncedAt) : payload.syncState === 'Synced' ? new Date() : null,
      }),
    );
  }

  async ingestOfflineAuditEvents(request: Request, payload: IngestOfflineAuditEventsDto) {
    const tenant = getTenantContextFromRequest(request);
    const auditRepository = await this.tenantRepositoryResolver.getOfflineAuditEventRepository(tenant);

    const saved = await Promise.all(
      payload.events.map((event) =>
        auditRepository.save(
          auditRepository.create({
            tenantId: tenant.tenantId,
            userId: event.userId,
            deviceId: event.deviceId,
            eventType: event.eventType,
            eventPayload: event.eventPayload,
            eventAt: new Date(event.eventAt),
          }),
        ),
      ),
    );

    return {
      ingested: saved.length,
    };
  }
}