import { Body, Controller, Get, Inject, Post, Put, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { IngestOfflineAuditEventsDto } from './dto/ingest-offline-audit-events.dto.js';
import { ListSyncSessionsQueryDto } from './dto/list-sync-sessions-query.dto.js';
import { UpsertSyncSessionDto } from './dto/upsert-sync-session.dto.js';
import { OfflineService } from './offline.service.js';

@Controller('offline')
export class OfflineController {
  constructor(@Inject(OfflineService) private readonly offlineService: OfflineService) {}

  @Get('sync-sessions')
  @Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin)
  listSyncSessions(@Req() request: Request, @Query() query: ListSyncSessionsQueryDto) {
    return this.offlineService.listSyncSessions(request, query);
  }

  @Put('sync-sessions')
  @Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin)
  upsertSyncSession(@Req() request: Request, @Body() payload: UpsertSyncSessionDto) {
    return this.offlineService.upsertSyncSession(request, payload);
  }

  @Post('audit-events/batch')
  @Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin)
  ingestOfflineAuditEvents(@Req() request: Request, @Body() payload: IngestOfflineAuditEventsDto) {
    return this.offlineService.ingestOfflineAuditEvents(request, payload);
  }
}