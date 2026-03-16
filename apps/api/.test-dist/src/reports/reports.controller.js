var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { GenerateReportDto } from './dto/generate-report.dto.js';
import { ReportsService } from './reports.service.js';
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    listReports(request, caseId) {
        return this.reportsService.listReports(request, caseId);
    }
    generateReport(request, caseId, payload) {
        return this.reportsService.generateReport(request, caseId, payload);
    }
    signLatestReport(request, caseId) {
        return this.reportsService.signLatestReport(request, caseId);
    }
    exportLatestReport(request, caseId) {
        return this.reportsService.exportLatestReport(request, caseId);
    }
};
__decorate([
    Get(':caseId'),
    Roles(roles.Pathologist, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "listReports", null);
__decorate([
    Post(':caseId/generate'),
    Roles(roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, GenerateReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "generateReport", null);
__decorate([
    Post(':caseId/sign'),
    Roles(roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "signLatestReport", null);
__decorate([
    Post(':caseId/export'),
    Roles(roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "exportLatestReport", null);
ReportsController = __decorate([
    Controller('reports'),
    __param(0, Inject(ReportsService)),
    __metadata("design:paramtypes", [ReportsService])
], ReportsController);
export { ReportsController };
