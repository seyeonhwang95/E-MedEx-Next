import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { CreateMediaAssetDto } from './dto/create-media-asset.dto.js';
import type { ListMediaAssetsQueryDto } from './dto/list-media-assets-query.dto.js';

@Injectable()
export class MediaService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async listMediaAssets(request: Request, query: ListMediaAssetsQueryDto) {
    const tenant = getTenantContextFromRequest(request);
    const mediaAssetRepository = await this.tenantRepositoryResolver.getMediaAssetRepository(tenant);
    const where = {
      tenantId: tenant.tenantId,
      ...(query.caseId ? { caseId: query.caseId } : {}),
      ...(query.mediaType ? { mediaType: query.mediaType } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await mediaAssetRepository.findAndCount({
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

  async getMediaAssetById(request: Request, mediaAssetId: string) {
    const mediaAsset = await this.getMediaAssetOrThrow(request, mediaAssetId);

    await this.writeAuditEvent(request, {
      eventType: 'media_asset_viewed',
      targetType: 'media_asset',
      targetId: mediaAssetId,
      beforeState: null,
      afterState: {
        mediaType: String((mediaAsset as Record<string, unknown>).mediaType ?? ''),
        objectKey: String((mediaAsset as Record<string, unknown>).objectKey ?? ''),
      },
    });

    return mediaAsset;
  }

  async getMediaAssetDownload(request: Request, mediaAssetId: string) {
    const mediaAsset = (await this.getMediaAssetOrThrow(request, mediaAssetId)) as Record<string, unknown>;
    const objectKey = String(mediaAsset.objectKey ?? '');
    const fileName = mediaAsset.fileName ? String(mediaAsset.fileName) : 'media-asset.bin';

    await this.writeAuditEvent(request, {
      eventType: 'media_asset_downloaded',
      targetType: 'media_asset',
      targetId: mediaAssetId,
      beforeState: null,
      afterState: {
        mediaType: String(mediaAsset.mediaType ?? ''),
        objectKey,
      },
    });

    return {
      mediaAssetId,
      fileName,
      mimeType: mediaAsset.contentType ? String(mediaAsset.contentType) : 'application/octet-stream',
      expiresInSeconds: 900,
      downloadUrl: `https://minio.localhost/${encodeURIComponent(objectKey)}?signature=local-dev`,
    };
  }

  async createMediaAsset(request: Request, payload: CreateMediaAssetDto) {
    const tenant = getTenantContextFromRequest(request);
    const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
    const mediaAssetRepository = await this.tenantRepositoryResolver.getMediaAssetRepository(tenant);

    const caseRecord = await caseRepository.findOne({
      where: {
        id: payload.caseId,
        tenantId: tenant.tenantId,
      },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found for media asset: ${payload.caseId}`);
    }

    return mediaAssetRepository.save(
      mediaAssetRepository.create({
        tenantId: tenant.tenantId,
        caseId: payload.caseId,
        mediaType: payload.mediaType,
        objectKey: payload.objectKey,
        fileName: payload.fileName ?? null,
        contentType: payload.contentType ?? null,
        sha256: payload.sha256 ?? null,
        capturedAt: payload.capturedAt ? new Date(payload.capturedAt) : null,
      }),
    );
  }

  private async getMediaAssetOrThrow(request: Request, mediaAssetId: string) {
    const tenant = getTenantContextFromRequest(request);
    const mediaAssetRepository = await this.tenantRepositoryResolver.getMediaAssetRepository(tenant);

    const mediaAsset = await mediaAssetRepository.findOne({
      where: {
        id: mediaAssetId,
        tenantId: tenant.tenantId,
      },
    });

    if (!mediaAsset) {
      throw new NotFoundException(`Media asset not found: ${mediaAssetId}`);
    }

    return mediaAsset;
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
        actorRoles: Array.isArray(requestWithAuth.auth?.roles) ? requestWithAuth.auth.roles : null,
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
}