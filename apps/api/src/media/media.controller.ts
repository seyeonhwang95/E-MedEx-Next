import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateMediaAssetDto } from './dto/create-media-asset.dto.js';
import { ListMediaAssetsQueryDto } from './dto/list-media-assets-query.dto.js';
import { MediaService } from './media.service.js';

@Controller('media-assets')
export class MediaController {
  constructor(@Inject(MediaService) private readonly mediaService: MediaService) {}

  @Get()
  @Roles(roles.Investigator, roles.Pathologist, roles.FieldIntake, roles.LabReviewer, roles.TenantAdmin)
  listMediaAssets(@Req() request: Request, @Query() query: ListMediaAssetsQueryDto) {
    return this.mediaService.listMediaAssets(request, query);
  }

  @Get(':mediaAssetId')
  @Roles(roles.Investigator, roles.Pathologist, roles.FieldIntake, roles.LabReviewer, roles.TenantAdmin)
  getMediaAssetById(@Req() request: Request, @Param('mediaAssetId', ParseUUIDPipe) mediaAssetId: string) {
    return this.mediaService.getMediaAssetById(request, mediaAssetId);
  }

  @Get(':mediaAssetId/download')
  @Roles(roles.Investigator, roles.Pathologist, roles.FieldIntake, roles.LabReviewer, roles.TenantAdmin)
  getMediaAssetDownload(@Req() request: Request, @Param('mediaAssetId', ParseUUIDPipe) mediaAssetId: string) {
    return this.mediaService.getMediaAssetDownload(request, mediaAssetId);
  }

  @Post()
  @Roles(roles.Investigator, roles.FieldIntake, roles.TenantAdmin)
  createMediaAsset(@Req() request: Request, @Body() payload: CreateMediaAssetDto) {
    return this.mediaService.createMediaAsset(request, payload);
  }
}