import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CasesService } from './cases.service.js';
import { AssignCanonicalNumberDto } from './dto/assign-canonical-number.dto.js';
import { CreateCaseDto } from './dto/create-case.dto.js';
import { ListCasesQueryDto } from './dto/list-cases-query.dto.js';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto.js';

@Controller('cases')
export class CasesController {
  constructor(@Inject(CasesService) private readonly casesService: CasesService) {}

  @Get()
  @Roles(roles.Investigator, roles.TenantAdmin)
  listCases(@Req() request: Request, @Query() query: ListCasesQueryDto) {
    return this.casesService.listCases(request, query);
  }

  @Get(':caseId')
  @Roles(roles.Investigator, roles.TenantAdmin)
  getCaseById(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.casesService.getCaseById(request, caseId);
  }

  @Post()
  @Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin)
  createCase(@Req() request: Request, @Body() payload: CreateCaseDto) {
    return this.casesService.createCase(request, payload);
  }

  @Patch(':caseId/status')
  @Roles(roles.Investigator, roles.TenantAdmin)
  updateCaseStatus(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() payload: UpdateCaseStatusDto,
  ) {
    return this.casesService.updateCaseStatus(request, caseId, payload);
  }

  @Post(':caseId/assign-canonical')
  @Roles(roles.Investigator, roles.TenantAdmin)
  assignCanonicalNumber(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() payload: AssignCanonicalNumberDto,
  ) {
    return this.casesService.assignCanonicalNumber(request, caseId, payload);
  }
}