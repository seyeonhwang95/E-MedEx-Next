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
import { Body, Controller, Get, Inject, Post, Put, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { IngestOfflineAuditEventsDto } from './dto/ingest-offline-audit-events.dto.js';
import { ListSyncSessionsQueryDto } from './dto/list-sync-sessions-query.dto.js';
import { UpsertSyncSessionDto } from './dto/upsert-sync-session.dto.js';
import { OfflineService } from './offline.service.js';
let OfflineController = class OfflineController {
    offlineService;
    constructor(offlineService) {
        this.offlineService = offlineService;
    }
    listSyncSessions(request, query) {
        return this.offlineService.listSyncSessions(request, query);
    }
    upsertSyncSession(request, payload) {
        return this.offlineService.upsertSyncSession(request, payload);
    }
    ingestOfflineAuditEvents(request, payload) {
        return this.offlineService.ingestOfflineAuditEvents(request, payload);
    }
};
__decorate([
    Get('sync-sessions'),
    Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListSyncSessionsQueryDto]),
    __metadata("design:returntype", void 0)
], OfflineController.prototype, "listSyncSessions", null);
__decorate([
    Put('sync-sessions'),
    Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpsertSyncSessionDto]),
    __metadata("design:returntype", void 0)
], OfflineController.prototype, "upsertSyncSession", null);
__decorate([
    Post('audit-events/batch'),
    Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, IngestOfflineAuditEventsDto]),
    __metadata("design:returntype", void 0)
], OfflineController.prototype, "ingestOfflineAuditEvents", null);
OfflineController = __decorate([
    Controller('offline'),
    __param(0, Inject(OfflineService)),
    __metadata("design:paramtypes", [OfflineService])
], OfflineController);
export { OfflineController };
