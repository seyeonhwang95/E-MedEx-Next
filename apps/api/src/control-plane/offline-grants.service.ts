import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import type { Repository } from 'typeorm';

import { apiErrorCodes } from '../common/api-error-codes.js';
import { OfflineDeviceGrantEntity } from '../persistence/entities/control-plane.entity.js';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type {
  AcknowledgeOfflineGrantWipeRequest,
  AcknowledgeOfflineGrantWipeResult,
  EnrollOfflineGrantRequest,
  OfflineGrantRecord,
  RevokeOfflineGrantRequest,
  ValidateOfflineGrantRequest,
  ValidateOfflineGrantResult,
} from './types.js';
import type { TenantContext } from '../tenancy/tenant-context.js';

@Injectable()
export class OfflineGrantsService {
  constructor(
    @InjectRepository(OfflineDeviceGrantEntity)
    private readonly offlineDeviceGrantRepository: Repository<OfflineDeviceGrantEntity>,
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async listOfflineGrants(query: { tenantId?: string; userId?: string; status?: 'active' | 'revoked' | 'expired' }) {
    const records = await this.offlineDeviceGrantRepository.find({
      where: {
        ...(query.tenantId ? { tenantId: query.tenantId.toLowerCase() } : {}),
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      order: { createdAt: 'DESC' },
      take: 200,
    });

    return records.map((record) => this.toRecord(record));
  }

  async listOfflineGrantAuditEvents(
    grantId: string,
    query: {
      tenantId: string;
      page: number;
      pageSize: number;
      eventType?:
        | 'offline_grant_enrolled'
        | 'offline_grant_validated'
        | 'offline_grant_revoked'
        | 'offline_grant_wipe_acknowledged';
      from?: string;
      to?: string;
      sort?: 'eventAt:desc' | 'eventAt:asc';
      cursor?: string;
    },
  ) {
    const tenant = this.buildTenantContext(query.tenantId);
    const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);

    const [items] = await auditRepository.findAndCount({
      where: {
        tenantId: tenant.tenantId,
        targetType: 'offline_grant',
        targetId: grantId,
        ...(query.eventType ? { eventType: query.eventType } : {}),
      },
      order: { eventAt: 'DESC' },
    });

    const fromTimestamp = query.from ? Date.parse(query.from) : Number.NEGATIVE_INFINITY;
    const toTimestamp = query.to ? Date.parse(query.to) : Number.POSITIVE_INFINITY;

    const filteredItems = items.filter((item) => {
      const eventAtRaw = (item as Record<string, unknown>).eventAt;
      const eventAtTimestamp =
        eventAtRaw instanceof Date ? eventAtRaw.getTime() : eventAtRaw ? Date.parse(String(eventAtRaw)) : Number.NaN;

      if (Number.isNaN(eventAtTimestamp)) {
        return false;
      }

      return eventAtTimestamp >= fromTimestamp && eventAtTimestamp <= toTimestamp;
    });

    filteredItems.sort((left, right) => {
      const leftRaw = (left as Record<string, unknown>).eventAt;
      const rightRaw = (right as Record<string, unknown>).eventAt;
      const leftTimestamp = leftRaw instanceof Date ? leftRaw.getTime() : Date.parse(String(leftRaw ?? ''));
      const rightTimestamp = rightRaw instanceof Date ? rightRaw.getTime() : Date.parse(String(rightRaw ?? ''));

      if (leftTimestamp === rightTimestamp) {
        return 0;
      }

      const ascending = query.sort === 'eventAt:asc';
      return ascending ? leftTimestamp - rightTimestamp : rightTimestamp - leftTimestamp;
    });

    const total = filteredItems.length;

    if (query.cursor !== undefined) {
      const cursorInput = query.cursor.trim();
      const decodedCursor = cursorInput.length > 0 ? this.decodeCursor(cursorInput) : null;

      if (cursorInput.length > 0 && !decodedCursor) {
        throw new BadRequestException({
          code: apiErrorCodes.InvalidCursor,
          message: 'Invalid cursor',
        });
      }

      const matchedIndex = decodedCursor
        ? filteredItems.findIndex((item) => {
            const row = item as Record<string, unknown>;
            const rowId = String(row.id ?? '');
            const eventAtRaw = row.eventAt;
            const rowEventAt = eventAtRaw instanceof Date ? eventAtRaw.toISOString() : String(eventAtRaw ?? '');
            return rowId === decodedCursor.id && rowEventAt === decodedCursor.eventAt;
          })
        : -1;

      if (decodedCursor && matchedIndex < 0) {
        throw new BadRequestException({
          code: apiErrorCodes.InvalidCursor,
          message: 'Invalid cursor',
        });
      }

      const startIndex = decodedCursor ? matchedIndex + 1 : 0;

      const cursorItems = filteredItems.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + query.pageSize);
      const lastItem = cursorItems[cursorItems.length - 1] as Record<string, unknown> | undefined;
      const hasMore = Math.max(startIndex, 0) + query.pageSize < filteredItems.length;
      const nextCursor = hasMore && lastItem ? this.encodeCursor(lastItem) : null;

      return {
        items: cursorItems,
        page: 1,
        pageSize: query.pageSize,
        total,
        nextCursor,
      };
    }

    const skip = (query.page - 1) * query.pageSize;
    const pagedItems = filteredItems.slice(skip, skip + query.pageSize);

    return {
      items: pagedItems,
      page: query.page,
      pageSize: query.pageSize,
      total,
      nextCursor: null,
    };
  }

  async enrollOfflineGrant(httpRequest: Request, request: EnrollOfflineGrantRequest): Promise<OfflineGrantRecord> {
    const tenantId = request.tenantId.toLowerCase();
    const scope = request.scope ?? 'FieldIntake';
    const ttlHours = request.ttlHours ?? 48;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    const existing = await this.offlineDeviceGrantRepository.findOne({
      where: {
        tenantId,
        userId: request.userId,
        deviceId: request.deviceId,
        scope,
      },
    });

    const saved = await this.offlineDeviceGrantRepository.save(
      this.offlineDeviceGrantRepository.create({
        ...(existing ?? {}),
        grantId: randomUUID(),
        tenantId,
        userId: request.userId,
        deviceId: request.deviceId,
        scope,
        status: 'active',
        expiresAt,
        issuedBy: request.issuedBy ?? null,
        revokedBy: null,
        revokedAt: null,
        wipeRequired: false,
      }),
    );

    const enrolled = this.toRecord(saved);

    await this.writeAuditEvent(httpRequest, {
      eventType: 'offline_grant_enrolled',
      targetType: 'offline_grant',
      targetId: saved.grantId,
      beforeState: null,
      afterState: enrolled,
    });

    return enrolled;
  }

  async validateOfflineGrant(httpRequest: Request, request: ValidateOfflineGrantRequest): Promise<ValidateOfflineGrantResult> {
    const tenantId = request.tenantId.toLowerCase();
    const scope = request.scope ?? 'FieldIntake';
    const record = await this.offlineDeviceGrantRepository.findOne({
      where: {
        grantId: request.grantId,
        tenantId,
        userId: request.userId,
        deviceId: request.deviceId,
        scope,
      },
    });

    if (!record) {
      const result: ValidateOfflineGrantResult = {
        valid: false,
        reason: 'NOT_FOUND',
        wipeRequired: false,
        grant: null,
      };

      await this.writeAuditEvent(httpRequest, {
        eventType: 'offline_grant_validated',
        targetType: 'offline_grant',
        targetId: request.grantId,
        beforeState: null,
        afterState: result as unknown as Record<string, unknown>,
      });

      return result;
    }

    if (record.status === 'revoked') {
      const result: ValidateOfflineGrantResult = {
        valid: false,
        reason: 'REVOKED',
        wipeRequired: record.wipeRequired,
        grant: this.toRecord(record),
      };

      await this.writeAuditEvent(httpRequest, {
        eventType: 'offline_grant_validated',
        targetType: 'offline_grant',
        targetId: record.grantId,
        beforeState: this.toRecord(record),
        afterState: result as unknown as Record<string, unknown>,
      });

      return result;
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      if (record.status !== 'expired') {
        record.status = 'expired';
        await this.offlineDeviceGrantRepository.save(record);
      }

      const result: ValidateOfflineGrantResult = {
        valid: false,
        reason: 'EXPIRED',
        wipeRequired: false,
        grant: this.toRecord(record),
      };

      await this.writeAuditEvent(httpRequest, {
        eventType: 'offline_grant_validated',
        targetType: 'offline_grant',
        targetId: record.grantId,
        beforeState: this.toRecord(record),
        afterState: result as unknown as Record<string, unknown>,
      });

      return result;
    }

    const result: ValidateOfflineGrantResult = {
      valid: true,
      reason: 'OK',
      wipeRequired: record.wipeRequired,
      grant: this.toRecord(record),
    };

    await this.writeAuditEvent(httpRequest, {
      eventType: 'offline_grant_validated',
      targetType: 'offline_grant',
      targetId: record.grantId,
      beforeState: this.toRecord(record),
      afterState: result as unknown as Record<string, unknown>,
    });

    return result;
  }

  async revokeOfflineGrant(httpRequest: Request, request: RevokeOfflineGrantRequest): Promise<OfflineGrantRecord> {
    const tenantId = request.tenantId.toLowerCase();
    const record = await this.offlineDeviceGrantRepository.findOne({
      where: {
        grantId: request.grantId,
        tenantId,
        userId: request.userId,
        deviceId: request.deviceId,
      },
    });

    if (!record) {
      const now = new Date();
      return {
        grantId: request.grantId,
        tenantId,
        userId: request.userId,
        deviceId: request.deviceId,
        scope: 'FieldIntake',
        status: 'revoked',
        expiresAt: now.toISOString(),
        issuedBy: null,
        revokedBy: request.revokedBy ?? null,
        revokedAt: now.toISOString(),
        wipeRequired: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }

    const beforeState = this.toRecord(record);
    record.status = 'revoked';
    record.revokedBy = request.revokedBy ?? null;
    record.revokedAt = new Date();
    record.wipeRequired = true;

    const saved = await this.offlineDeviceGrantRepository.save(record);
    const revoked = this.toRecord(saved);

    await this.writeAuditEvent(httpRequest, {
      eventType: 'offline_grant_revoked',
      targetType: 'offline_grant',
      targetId: saved.grantId,
      beforeState,
      afterState: revoked,
    });

    return revoked;
  }

  async acknowledgeOfflineGrantWipe(
    httpRequest: Request,
    request: AcknowledgeOfflineGrantWipeRequest,
  ): Promise<AcknowledgeOfflineGrantWipeResult> {
    const tenantId = request.tenantId.toLowerCase();
    const scope = request.scope ?? 'FieldIntake';
    const record = await this.offlineDeviceGrantRepository.findOne({
      where: {
        grantId: request.grantId,
        tenantId,
        userId: request.userId,
        deviceId: request.deviceId,
        scope,
      },
    });

    if (!record) {
      return {
        acknowledged: false,
        reason: 'NOT_FOUND',
        grant: null,
      };
    }

    if (record.status !== 'revoked') {
      return {
        acknowledged: false,
        reason: 'NOT_REVOKED',
        grant: this.toRecord(record),
      };
    }

    const beforeState = this.toRecord(record);
    record.wipeRequired = false;
    const saved = await this.offlineDeviceGrantRepository.save(record);

    await this.writeAuditEvent(httpRequest, {
      eventType: 'offline_grant_wipe_acknowledged',
      targetType: 'offline_grant',
      targetId: saved.grantId,
      beforeState,
      afterState: this.toRecord(saved),
    });

    return {
      acknowledged: true,
      reason: 'OK',
      grant: this.toRecord(saved),
    };
  }

  private toRecord(entity: OfflineDeviceGrantEntity): OfflineGrantRecord {
    return {
      grantId: entity.grantId,
      tenantId: entity.tenantId,
      userId: entity.userId,
      deviceId: entity.deviceId,
      scope: entity.scope as 'FieldIntake',
      status: entity.status,
      expiresAt: entity.expiresAt.toISOString(),
      issuedBy: entity.issuedBy,
      revokedBy: entity.revokedBy,
      revokedAt: entity.revokedAt ? entity.revokedAt.toISOString() : null,
      wipeRequired: entity.wipeRequired,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private getActorSubject(request: Request): string {
    try {
      const principal = getAuthPrincipalFromRequest(request);
      return principal.subject;
    } catch {
      const requestWithAuth = request as Request & { auth?: { subject?: string } };
      return requestWithAuth.auth?.subject ?? 'system';
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
    const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
    const actorSubject = this.getActorSubject(request);
    const requestWithAuth = request as Request & { auth?: { roles?: string[]; claims?: Record<string, unknown> } };

    await auditRepository.save(
      auditRepository.create({
        tenantId: tenant.tenantId,
        actorSubject,
        actorRoles: Array.isArray(requestWithAuth.auth?.roles) ? requestWithAuth.auth?.roles : null,
        deviceId: requestWithAuth.auth?.claims?.device_id ? String(requestWithAuth.auth.claims.device_id) : null,
        ipAddress: request.ip ?? request.socket.remoteAddress ?? null,
        eventType: input.eventType,
        targetType: input.targetType,
        targetId: input.targetId,
        beforeState: input.beforeState,
        afterState: input.afterState,
      }),
    );
  }

  private buildTenantContext(tenantIdInput: string): TenantContext {
    const tenantId = tenantIdInput.toLowerCase();
    return {
      tenantId,
      subdomain: tenantId,
      tenantDbName: `emedex_${tenantId}`,
      tenantDbSecretRef: null,
      storagePrefix: `emedex-media/${tenantId}`,
      searchPrefix: `emedex-${tenantId}`,
    };
  }

  private encodeCursor(item: Record<string, unknown>): string {
    const eventAtRaw = item.eventAt;
    const payload = {
      id: String(item.id ?? ''),
      eventAt: eventAtRaw instanceof Date ? eventAtRaw.toISOString() : String(eventAtRaw ?? ''),
    };

    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  }

  private decodeCursor(cursor: string): { id: string; eventAt: string } | null {
    try {
      const json = Buffer.from(cursor, 'base64url').toString('utf8');
      const parsed = JSON.parse(json) as { id?: unknown; eventAt?: unknown };

      if (typeof parsed.id !== 'string' || typeof parsed.eventAt !== 'string') {
        return null;
      }

      return {
        id: parsed.id,
        eventAt: parsed.eventAt,
      };
    } catch {
      return null;
    }
  }
}