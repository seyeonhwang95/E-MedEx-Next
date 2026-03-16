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
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { UpsertIndigentCaseDto } from './dto/upsert-indigent-case.dto.js';
import { IndigentService } from './indigent.service.js';
let IndigentController = class IndigentController {
    indigentService;
    constructor(indigentService) {
        this.indigentService = indigentService;
    }
    getByCaseId(request, caseId) {
        return this.indigentService.getByCaseId(request, caseId);
    }
    upsertByCaseId(request, caseId, payload) {
        return this.indigentService.upsertByCaseId(request, caseId, payload);
    }
};
__decorate([
    Get(':caseId'),
    Roles(roles.Investigator, roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IndigentController.prototype, "getByCaseId", null);
__decorate([
    Put(':caseId'),
    Roles(roles.Investigator, roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpsertIndigentCaseDto]),
    __metadata("design:returntype", void 0)
], IndigentController.prototype, "upsertByCaseId", null);
IndigentController = __decorate([
    Controller('indigent-cases'),
    __param(0, Inject(IndigentService)),
    __metadata("design:paramtypes", [IndigentService])
], IndigentController);
export { IndigentController };
