import { Body, Controller, Get, Inject, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateProtocolVersionDto } from './dto/create-protocol-version.dto.js';
import { UpdateProtocolVersionDto } from './dto/update-protocol-version.dto.js';
import { ProtocolsService } from './protocols.service.js';

@Controller('protocols')
export class ProtocolsController {
  constructor(@Inject(ProtocolsService) private readonly protocolsService: ProtocolsService) {}

  @Get(':caseId/versions')
  @Roles(roles.Pathologist, roles.Investigator, roles.TenantAdmin)
  listVersions(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.protocolsService.listVersions(request, caseId);
  }

  @Post(':caseId/versions')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  createVersion(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string, @Body() payload: CreateProtocolVersionDto) {
    return this.protocolsService.createVersion(request, caseId, payload);
  }

  @Put(':caseId/versions/:versionNo')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  updateVersion(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('versionNo', ParseIntPipe) versionNo: number,
    @Body() payload: UpdateProtocolVersionDto,
  ) {
    return this.protocolsService.updateVersion(request, caseId, versionNo, payload);
  }

  @Post(':caseId/versions/:versionNo/submit-review')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  submitForReview(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('versionNo', ParseIntPipe) versionNo: number,
  ) {
    return this.protocolsService.submitForReview(request, caseId, versionNo);
  }

  @Post(':caseId/versions/:versionNo/finalize')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  finalizeVersion(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('versionNo', ParseIntPipe) versionNo: number,
  ) {
    return this.protocolsService.finalizeVersion(request, caseId, versionNo);
  }
}