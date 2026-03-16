import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { GenerateReportDto } from './dto/generate-report.dto.js';
import { ReportsService } from './reports.service.js';

@Controller('reports')
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly reportsService: ReportsService) {}

  @Get(':caseId')
  @Roles(roles.Pathologist, roles.Investigator, roles.TenantAdmin)
  listReports(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.reportsService.listReports(request, caseId);
  }

  @Post(':caseId/generate')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  generateReport(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string, @Body() payload: GenerateReportDto) {
    return this.reportsService.generateReport(request, caseId, payload);
  }

  @Post(':caseId/sign')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  signLatestReport(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.reportsService.signLatestReport(request, caseId);
  }

  @Post(':caseId/export')
  @Roles(roles.Pathologist, roles.TenantAdmin)
  exportLatestReport(@Req() request: Request, @Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.reportsService.exportLatestReport(request, caseId);
  }
}