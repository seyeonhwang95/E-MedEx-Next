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
import { Body, Controller, Get, Inject, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { CreateProtocolVersionDto } from './dto/create-protocol-version.dto.js';
import { UpdateProtocolVersionDto } from './dto/update-protocol-version.dto.js';
import { ProtocolsService } from './protocols.service.js';
let ProtocolsController = class ProtocolsController {
    protocolsService;
    constructor(protocolsService) {
        this.protocolsService = protocolsService;
    }
    listVersions(request, caseId) {
        return this.protocolsService.listVersions(request, caseId);
    }
    createVersion(request, caseId, payload) {
        return this.protocolsService.createVersion(request, caseId, payload);
    }
    updateVersion(request, caseId, versionNo, payload) {
        return this.protocolsService.updateVersion(request, caseId, versionNo, payload);
    }
    submitForReview(request, caseId, versionNo) {
        return this.protocolsService.submitForReview(request, caseId, versionNo);
    }
    finalizeVersion(request, caseId, versionNo) {
        return this.protocolsService.finalizeVersion(request, caseId, versionNo);
    }
};
__decorate([
    Get(':caseId/versions'),
    Roles(roles.Pathologist, roles.Investigator, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProtocolsController.prototype, "listVersions", null);
__decorate([
    Post(':caseId/versions'),
    Roles(roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CreateProtocolVersionDto]),
    __metadata("design:returntype", void 0)
], ProtocolsController.prototype, "createVersion", null);
__decorate([
    Put(':caseId/versions/:versionNo'),
    Roles(roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Param('versionNo', ParseIntPipe)),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, UpdateProtocolVersionDto]),
    __metadata("design:returntype", void 0)
], ProtocolsController.prototype, "updateVersion", null);
__decorate([
    Post(':caseId/versions/:versionNo/submit-review'),
    Roles(roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Param('versionNo', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", void 0)
], ProtocolsController.prototype, "submitForReview", null);
__decorate([
    Post(':caseId/versions/:versionNo/finalize'),
    Roles(roles.Pathologist, roles.TenantAdmin),
    __param(0, Req()),
    __param(1, Param('caseId', ParseUUIDPipe)),
    __param(2, Param('versionNo', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", void 0)
], ProtocolsController.prototype, "finalizeVersion", null);
ProtocolsController = __decorate([
    Controller('protocols'),
    __param(0, Inject(ProtocolsService)),
    __metadata("design:paramtypes", [ProtocolsService])
], ProtocolsController);
export { ProtocolsController };
