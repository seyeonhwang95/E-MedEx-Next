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
import { Body, Controller, Get, Inject, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateReferenceAgencyDto } from './dto/create-reference-agency.dto.js';
import { CreateReferenceCaseTypeDto } from './dto/create-reference-case-type.dto.js';
import { ListReferenceAgenciesQueryDto } from './dto/list-reference-agencies-query.dto.js';
import { ListReferenceCaseTypesQueryDto } from './dto/list-reference-case-types-query.dto.js';
import { ReferenceService } from './reference.service.js';
let ReferenceController = class ReferenceController {
    referenceService;
    constructor(referenceService) {
        this.referenceService = referenceService;
    }
    listAgencies(request, query) {
        return this.referenceService.listAgencies(request, query);
    }
    createAgency(request, payload) {
        return this.referenceService.createAgency(request, payload);
    }
    listCaseTypes(request, query) {
        return this.referenceService.listCaseTypes(request, query);
    }
    createCaseType(request, payload) {
        return this.referenceService.createCaseType(request, payload);
    }
};
__decorate([
    Get('agencies'),
    Roles(roles.TenantAdmin, roles.Investigator, roles.Pathologist),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListReferenceAgenciesQueryDto]),
    __metadata("design:returntype", void 0)
], ReferenceController.prototype, "listAgencies", null);
__decorate([
    Post('agencies'),
    Roles(roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateReferenceAgencyDto]),
    __metadata("design:returntype", void 0)
], ReferenceController.prototype, "createAgency", null);
__decorate([
    Get('case-types'),
    Roles(roles.TenantAdmin, roles.Investigator, roles.Pathologist),
    __param(0, Req()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListReferenceCaseTypesQueryDto]),
    __metadata("design:returntype", void 0)
], ReferenceController.prototype, "listCaseTypes", null);
__decorate([
    Post('case-types'),
    Roles(roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateReferenceCaseTypeDto]),
    __metadata("design:returntype", void 0)
], ReferenceController.prototype, "createCaseType", null);
ReferenceController = __decorate([
    Controller('reference'),
    __param(0, Inject(ReferenceService)),
    __metadata("design:paramtypes", [ReferenceService])
], ReferenceController);
export { ReferenceController };
