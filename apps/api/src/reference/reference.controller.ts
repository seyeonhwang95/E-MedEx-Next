import { Body, Controller, Get, Inject, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateReferenceAgencyDto } from './dto/create-reference-agency.dto.js';
import { CreateReferenceCaseTypeDto } from './dto/create-reference-case-type.dto.js';
import { ListReferenceAgenciesQueryDto } from './dto/list-reference-agencies-query.dto.js';
import { ListReferenceCaseTypesQueryDto } from './dto/list-reference-case-types-query.dto.js';
import { ReferenceService } from './reference.service.js';

@Controller('reference')
export class ReferenceController {
  constructor(@Inject(ReferenceService) private readonly referenceService: ReferenceService) {}

  @Get('agencies')
  @Roles(roles.TenantAdmin, roles.Investigator, roles.Pathologist)
  listAgencies(@Req() request: Request, @Query() query: ListReferenceAgenciesQueryDto) {
    return this.referenceService.listAgencies(request, query);
  }

  @Post('agencies')
  @Roles(roles.TenantAdmin)
  createAgency(@Req() request: Request, @Body() payload: CreateReferenceAgencyDto) {
    return this.referenceService.createAgency(request, payload);
  }

  @Get('case-types')
  @Roles(roles.TenantAdmin, roles.Investigator, roles.Pathologist)
  listCaseTypes(@Req() request: Request, @Query() query: ListReferenceCaseTypesQueryDto) {
    return this.referenceService.listCaseTypes(request, query);
  }

  @Post('case-types')
  @Roles(roles.TenantAdmin)
  createCaseType(@Req() request: Request, @Body() payload: CreateReferenceCaseTypeDto) {
    return this.referenceService.createCaseType(request, payload);
  }
}