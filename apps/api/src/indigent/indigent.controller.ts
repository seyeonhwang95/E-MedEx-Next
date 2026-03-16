import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { UpsertIndigentCaseDto } from './dto/upsert-indigent-case.dto.js';
import { IndigentService } from './indigent.service.js';

@Controller('indigent-cases')
export class IndigentController {
  constructor(@Inject(IndigentService) private readonly indigentService: IndigentService) {}

  @Get(':caseId')
  @Roles(roles.Investigator, roles.Pathologist, roles.TenantAdmin)
  getByCaseId(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.indigentService.getByCaseId(request, caseId);
  }

  @Put(':caseId')
  @Roles(roles.Investigator, roles.Pathologist, roles.TenantAdmin)
  upsertByCaseId(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() payload: UpsertIndigentCaseDto,
  ) {
    return this.indigentService.upsertByCaseId(request, caseId, payload);
  }
}