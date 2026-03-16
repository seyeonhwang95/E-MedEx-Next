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
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CasesService } from './cases.service.js';
import { AssignCanonicalNumberDto } from './dto/assign-canonical-number.dto.js';
import { CreateCaseDto } from './dto/create-case.dto.js';
import { ListCasesQueryDto } from './dto/list-cases-query.dto.js';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto.js';
let CasesController = class CasesController {
    casesService;
    constructor(casesService) {
        this.casesService = casesService;
    }
    listCases(request, query) {
        return this.casesService.listCases(request, query);
    }
    getCaseById(request, caseId) {
        return this.casesService.getCaseById(request, caseId);
    }
    createCase(request, payload) {
        return this.casesService.createCase(request, payload);
    }
    updateCaseStatus(request, caseId, payload) {
        return this.casesService.updateCaseStatus(request, caseId, payload);
    }
    assignCanonicalNumber(request, caseId, payload) {
        return this.casesService.assignCanonicalNumber(request, caseId, payload);
    }
};
__decorate([
    Get(),
    Roles(roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListCasesQueryDto]),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "listCases", null);
__decorate([
    Get(':caseId'),
    Roles(roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "getCaseById", null);
__decorate([
    Post(),
    Roles(roles.FieldIntake, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateCaseDto]),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "createCase", null);
__decorate([
    Patch(':caseId/status'),
    Roles(roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateCaseStatusDto]),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "updateCaseStatus", null);
__decorate([
    Post(':caseId/assign-canonical'),
    Roles(roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AssignCanonicalNumberDto]),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "assignCanonicalNumber", null);
CasesController = __decorate([
    Controller('cases'),
    __param(0, Inject(CasesService)),
    __metadata("design:paramtypes", [CasesService])
], CasesController);
export { CasesController };
