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
import { CreateCustodyEventDto } from './dto/create-custody-event.dto.js';
import { CreateEvidenceItemDto } from './dto/create-evidence-item.dto.js';
import { ListEvidenceQueryDto } from './dto/list-evidence-query.dto.js';
import { EvidenceService } from './evidence.service.js';
let EvidenceController = class EvidenceController {
    evidenceService;
    constructor(evidenceService) {
        this.evidenceService = evidenceService;
    }
    listEvidenceItems(request, query) {
        return this.evidenceService.listEvidenceItems(request, query);
    }
    getEvidenceByBarcode(request, barcode) {
        return this.evidenceService.getEvidenceByBarcode(request, barcode);
    }
    createEvidenceItem(request, payload) {
        return this.evidenceService.createEvidenceItem(request, payload);
    }
    listCustodyEvents(request, evidenceItemId) {
        return this.evidenceService.listCustodyEvents(request, evidenceItemId);
    }
    addCustodyEvent(request, evidenceItemId, payload) {
        return this.evidenceService.addCustodyEvent(request, evidenceItemId, payload);
    }
};
__decorate([
    Get(),
    Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListEvidenceQueryDto]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "listEvidenceItems", null);
__decorate([
    Get('barcode/:barcode'),
    Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake, roles.LabReviewer),
    __param(0, Req()),
    __param(1, Param('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "getEvidenceByBarcode", null);
__decorate([
    Post(),
    Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateEvidenceItemDto]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "createEvidenceItem", null);
__decorate([
    Get(':evidenceItemId/custody-events'),
    Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake, roles.LabReviewer),
    __param(0, Req()),
    __param(1, Param('evidenceItemId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "listCustodyEvents", null);
__decorate([
    Post(':evidenceItemId/custody-events'),
    Roles(roles.Investigator, roles.TenantAdmin, roles.FieldIntake, roles.LabReviewer),
    __param(0, Req()),
    __param(1, Param('evidenceItemId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CreateCustodyEventDto]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "addCustodyEvent", null);
EvidenceController = __decorate([
    Controller('evidence'),
    __param(0, Inject(EvidenceService)),
    __metadata("design:paramtypes", [EvidenceService])
], EvidenceController);
export { EvidenceController };
