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
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { ResolveTenantLabDto } from './dto/resolve-tenant-lab.dto.js';
import { UpsertTenantLabDto } from './dto/upsert-tenant-lab.dto.js';
import { TenantProvisioningService } from './tenant-provisioning.service.js';
let TenantAdminController = class TenantAdminController {
    tenantProvisioningService;
    constructor(tenantProvisioningService) {
        this.tenantProvisioningService = tenantProvisioningService;
    }
    listTenants() {
        return this.tenantProvisioningService.listTenants();
    }
    createTenant(request) {
        return this.tenantProvisioningService.createTenant(request);
    }
    listTenantLabs(tenantId) {
        return this.tenantProvisioningService.listTenantLabs(tenantId);
    }
    upsertTenantLab(tenantId, labCode, request) {
        return this.tenantProvisioningService.upsertTenantLab(tenantId, labCode, request);
    }
    resolveTenantLab(tenantId, request) {
        return this.tenantProvisioningService.resolveTenantLab(tenantId, request);
    }
};
__decorate([
    Get(),
    Roles(roles.PlatformAdmin),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantAdminController.prototype, "listTenants", null);
__decorate([
    Post(),
    Roles(roles.PlatformAdmin),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantAdminController.prototype, "createTenant", null);
__decorate([
    Get(':tenantId/labs'),
    Roles(roles.PlatformAdmin),
    __param(0, Param('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantAdminController.prototype, "listTenantLabs", null);
__decorate([
    Put(':tenantId/labs/:labCode'),
    Roles(roles.PlatformAdmin),
    __param(0, Param('tenantId')),
    __param(1, Param('labCode')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpsertTenantLabDto]),
    __metadata("design:returntype", void 0)
], TenantAdminController.prototype, "upsertTenantLab", null);
__decorate([
    Post(':tenantId/labs/resolve'),
    Roles(roles.PlatformAdmin),
    __param(0, Param('tenantId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ResolveTenantLabDto]),
    __metadata("design:returntype", void 0)
], TenantAdminController.prototype, "resolveTenantLab", null);
TenantAdminController = __decorate([
    Controller('control/tenants'),
    __metadata("design:paramtypes", [TenantProvisioningService])
], TenantAdminController);
export { TenantAdminController };
