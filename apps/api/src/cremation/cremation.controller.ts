import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { UpsertCremationCaseDto } from './dto/upsert-cremation-case.dto.js';
import { CremationService } from './cremation.service.js';

@Controller('cremation-cases')
export class CremationController {
  constructor(@Inject(CremationService) private readonly cremationService: CremationService) {}

  @Get(':caseId')
  @Roles(roles.Pathologist, roles.Investigator, roles.TenantAdmin)
  getByCaseId(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.cremationService.getByCaseId(request, caseId);
  }

  @Put(':caseId')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  upsertByCaseId(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() payload: UpsertCremationCaseDto,
  ) {
    return this.cremationService.upsertByCaseId(request, caseId, payload);
  }
}