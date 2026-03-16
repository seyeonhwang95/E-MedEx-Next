var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import { TENANT_REPOSITORY_RESOLVER, } from '../tenancy/tenant-repository.port.js';
let MediaService = class MediaService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async listMediaAssets(request, query) {
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
    async getMediaAssetById(request, mediaAssetId) {
        const mediaAsset = await this.getMediaAssetOrThrow(request, mediaAssetId);
        await this.writeAuditEvent(request, {
            eventType: 'media_asset_viewed',
            targetType: 'media_asset',
            targetId: mediaAssetId,
            beforeState: null,
            afterState: {
                mediaType: String(mediaAsset.mediaType ?? ''),
                objectKey: String(mediaAsset.objectKey ?? ''),
            },
        });
        return mediaAsset;
    }
    async getMediaAssetDownload(request, mediaAssetId) {
        const mediaAsset = (await this.getMediaAssetOrThrow(request, mediaAssetId));
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
    async createMediaAsset(request, payload) {
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
        return mediaAssetRepository.save(mediaAssetRepository.create({
            tenantId: tenant.tenantId,
            caseId: payload.caseId,
            mediaType: payload.mediaType,
            objectKey: payload.objectKey,
            fileName: payload.fileName ?? null,
            contentType: payload.contentType ?? null,
            sha256: payload.sha256 ?? null,
            capturedAt: payload.capturedAt ? new Date(payload.capturedAt) : null,
        }));
    }
    async getMediaAssetOrThrow(request, mediaAssetId) {
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
    getActorSubject(request) {
        try {
            const principal = getAuthPrincipalFromRequest(request);
            return principal.subject;
        }
        catch {
            const requestWithAuth = request;
            return requestWithAuth.auth?.subject ?? 'system';
        }
    }
    async writeAuditEvent(request, input) {
        const tenant = getTenantContextFromRequest(request);
        const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
        const actorSubject = this.getActorSubject(request);
        const requestWithAuth = request;
        await auditRepository.save(auditRepository.create({
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
        }));
    }
};
MediaService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], MediaService);
export { MediaService };
