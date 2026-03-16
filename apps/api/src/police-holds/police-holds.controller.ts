import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { UpsertPoliceHoldDto } from './dto/upsert-police-hold.dto.js';
import { PoliceHoldsService } from './police-holds.service.js';

@Controller('police-holds')
export class PoliceHoldsController {
  constructor(@Inject(PoliceHoldsService) private readonly policeHoldsService: PoliceHoldsService) {}

  @Get(':caseId')
  @Roles(roles.Investigator)
  getPoliceHoldByCaseId(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.policeHoldsService.getPoliceHoldByCaseId(request, caseId);
  }

  @Put(':caseId')
  @Roles(roles.Investigator)
  upsertPoliceHold(
    @Req() request: Request,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() payload: UpsertPoliceHoldDto,
  ) {
    return this.policeHoldsService.upsertPoliceHold(request, caseId, payload);
  }
}