import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateCustodyEventDto } from './dto/create-custody-event.dto.js';
import { CreateEvidenceItemDto } from './dto/create-evidence-item.dto.js';
import { ListEvidenceQueryDto } from './dto/list-evidence-query.dto.js';
import { EvidenceService } from './evidence.service.js';

@Controller('evidence')
export class EvidenceController {
  constructor(@Inject(EvidenceService) private readonly evidenceService: EvidenceService) {}

  @Get()
  @Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake)
  listEvidenceItems(@Req() request: Request, @Query() query: ListEvidenceQueryDto) {
    return this.evidenceService.listEvidenceItems(request, query);
  }

  @Get('barcode/:barcode')
  @Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake, roles.LabReviewer)
  getEvidenceByBarcode(@Req() request: Request, @Param('barcode') barcode: string) {
    return this.evidenceService.getEvidenceByBarcode(request, barcode);
  }

  @Post()
  @Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake)
  createEvidenceItem(@Req() request: Request, @Body() payload: CreateEvidenceItemDto) {
    return this.evidenceService.createEvidenceItem(request, payload);
  }

  @Get(':evidenceItemId/custody-events')
  @Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake, roles.LabReviewer)
  listCustodyEvents(@Req() request: Request, @Param('evidenceItemId', ParseUUIDPipe) evidenceItemId: string) {
    return this.evidenceService.listCustodyEvents(request, evidenceItemId);
  }

  @Post(':evidenceItemId/custody-events')
  @Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake, roles.LabReviewer)
  addCustodyEvent(
    @Req() request: Request,
    @Param('evidenceItemId', ParseUUIDPipe) evidenceItemId: string,
    @Body() payload: CreateCustodyEventDto,
  ) {
    return this.evidenceService.addCustodyEvent(request, evidenceItemId, payload);
  }
}