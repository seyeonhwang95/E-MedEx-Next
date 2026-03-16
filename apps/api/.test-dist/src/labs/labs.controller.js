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
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
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
let LabsController = class LabsController {
    labsService;
    constructor(labsService) {
        this.labsService = labsService;
    }
    listLabOrders(request, query) {
        return this.labsService.listLabOrders(request, query);
    }
    createLabOrder(request, payload) {
        return this.labsService.createLabOrder(request, payload);
    }
    listHl7Messages(request, query) {
        return this.labsService.listHl7Messages(request, query);
    }
    ingestHl7Message(request, payload) {
        return this.labsService.ingestHl7Message(request, payload);
    }
    listUnmatchedResults(request, query) {
        return this.labsService.listUnmatchedResults(request, query);
    }
    matchUnmatchedResult(request, unmatchedResultId, payload) {
        return this.labsService.matchUnmatchedResult(request, unmatchedResultId, payload);
    }
    rejectUnmatchedResult(request, unmatchedResultId, payload) {
        return this.labsService.rejectUnmatchedResult(request, unmatchedResultId, payload);
    }
};
__decorate([
    Get('orders'),
    Roles(roles.LabReviewer, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListLabOrdersQueryDto]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "listLabOrders", null);
__decorate([
    Post('orders'),
    Roles(roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateLabOrderDto]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "createLabOrder", null);
__decorate([
    Get('hl7/messages'),
    Roles(roles.LabReviewer, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListHl7MessagesQueryDto]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "listHl7Messages", null);
__decorate([
    Post('hl7/messages'),
    Roles(roles.LabReviewer, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, IngestHl7MessageDto]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "ingestHl7Message", null);
__decorate([
    Get('hl7/unmatched-results'),
    Roles(roles.LabReviewer, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListUnmatchedResultsQueryDto]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "listUnmatchedResults", null);
__decorate([
    Post('hl7/unmatched-results/:unmatchedResultId/match-case'),
    Roles(roles.LabReviewer, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('unmatchedResultId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, MatchUnmatchedResultDto]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "matchUnmatchedResult", null);
__decorate([
    Post('hl7/unmatched-results/:unmatchedResultId/reject'),
    Roles(roles.LabReviewer, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('unmatchedResultId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, RejectUnmatchedResultDto]),
    __metadata("design:returntype", void 0)
], LabsController.prototype, "rejectUnmatchedResult", null);
LabsController = __decorate([
    Controller('labs'),
    __param(0, Inject(LabsService)),
    __metadata("design:paramtypes", [LabsService])
], LabsController);
export { LabsController };
