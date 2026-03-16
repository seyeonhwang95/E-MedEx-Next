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
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateMediaAssetDto } from './dto/create-media-asset.dto.js';
import { ListMediaAssetsQueryDto } from './dto/list-media-assets-query.dto.js';
import { MediaService } from './media.service.js';
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    listMediaAssets(request, query) {
        return this.mediaService.listMediaAssets(request, query);
    }
    getMediaAssetById(request, mediaAssetId) {
        return this.mediaService.getMediaAssetById(request, mediaAssetId);
    }
    getMediaAssetDownload(request, mediaAssetId) {
        return this.mediaService.getMediaAssetDownload(request, mediaAssetId);
    }
    createMediaAsset(request, payload) {
        return this.mediaService.createMediaAsset(request, payload);
    }
};
__decorate([
    Get(),
    Roles(roles.Investigator, roles.Pathologist, roles.FieldIntake, roles.LabReviewer, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListMediaAssetsQueryDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "listMediaAssets", null);
__decorate([
    Get(':mediaAssetId'),
    Roles(roles.Investigator, roles.Pathologist, roles.FieldIntake, roles.LabReviewer, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('mediaAssetId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getMediaAssetById", null);
__decorate([
    Get(':mediaAssetId/download'),
    Roles(roles.Investigator, roles.Pathologist, roles.FieldIntake, roles.LabReviewer, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('mediaAssetId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getMediaAssetDownload", null);
__decorate([
    Post(),
    Roles(roles.Investigator, roles.FieldIntake, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateMediaAssetDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "createMediaAsset", null);
MediaController = __decorate([
    Controller('media-assets'),
    __param(0, Inject(MediaService)),
    __metadata("design:paramtypes", [MediaService])
], MediaController);
export { MediaController };
