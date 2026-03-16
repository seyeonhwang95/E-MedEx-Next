import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateLabOrderDto } from './dto/create-lab-order.dto.js';
import { IngestHl7MessageDto } from './dto/ingest-hl7-message.dto.js';
import { ListHl7MessagesQueryDto } from './dto/list-hl7-messages-query.dto.js';
import { ListLabOrdersQueryDto } from './dto/list-lab-orders-query.dto.js';
import { ListUnmatchedResultsQueryDto } from './dto/list-unmatched-results-query.dto.js';
import { MatchUnmatchedResultDto } from './dto/match-unmatched-result.dto.js';
import { RejectUnmatchedResultDto } from './dto/reject-unmatched-result.dto.js';
import { LabsService } from './labs.service.js';

@Controller('labs')
export class LabsController {
  constructor(@Inject(LabsService) private readonly labsService: LabsService) {}

  @Get('orders')
  @Roles(roles.LabReviewer, roles.Investigator, roles.TenantAdmin)
  listLabOrders(@Req() request: Request, @Query() query: ListLabOrdersQueryDto) {
    return this.labsService.listLabOrders(request, query);
  }

  @Post('orders')
  @Roles(roles.Investigator, roles.TenantAdmin)
  createLabOrder(@Req() request: Request, @Body() payload: CreateLabOrderDto) {
    return this.labsService.createLabOrder(request, payload);
  }

  @Get('hl7/messages')
  @Roles(roles.LabReviewer, roles.TenantAdmin)
  listHl7Messages(@Req() request: Request, @Query() query: ListHl7MessagesQueryDto) {
    return this.labsService.listHl7Messages(request, query);
  }

  @Post('hl7/messages')
  @Roles(roles.LabReviewer, roles.TenantAdmin)
  ingestHl7Message(@Req() request: Request, @Body() payload: IngestHl7MessageDto) {
    return this.labsService.ingestHl7Message(request, payload);
  }

  @Get('hl7/unmatched-results')
  @Roles(roles.LabReviewer, roles.Investigator, roles.TenantAdmin)
  listUnmatchedResults(@Req() request: Request, @Query() query: ListUnmatchedResultsQueryDto) {
    return this.labsService.listUnmatchedResults(request, query);
  }

  @Post('hl7/unmatched-results/:unmatchedResultId/match-case')
  @Roles(roles.LabReviewer, roles.TenantAdmin)
  matchUnmatchedResult(
    @Req() request: Request,
    @Param('unmatchedResultId', ParseUUIDPipe) unmatchedResultId: string,
    @Body() payload: MatchUnmatchedResultDto,
  ) {
    return this.labsService.matchUnmatchedResult(request, unmatchedResultId, payload);
  }

  @Post('hl7/unmatched-results/:unmatchedResultId/reject')
  @Roles(roles.LabReviewer, roles.TenantAdmin)
  rejectUnmatchedResult(
    @Req() request: Request,
    @Param('unmatchedResultId', ParseUUIDPipe) unmatchedResultId: string,
    @Body() payload: RejectUnmatchedResultDto,
  ) {
    return this.labsService.rejectUnmatchedResult(request, unmatchedResultId, payload);
  }
}