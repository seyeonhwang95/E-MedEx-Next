import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { UpsertInvestigationDto } from './dto/upsert-investigation.dto.js';
import { InvestigationsService } from './investigations.service.js';

@Controller('investigations')
export class InvestigationsController {
  constructor(@Inject(InvestigationsService) private readonly investigationsService: InvestigationsService) {}

  @Get(':caseId')
  @Roles(roles.Investigator)
  getInvestigationByCaseId(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.investigationsService.getInvestigationByCaseId(request, caseId);
  }

  @Put(':caseId')
  @Roles(roles.Investigator)
  upsertInvestigation(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() payload: UpsertInvestigationDto,
  ) {
    return this.investigationsService.upsertInvestigation(request, caseId, payload);
  }
}