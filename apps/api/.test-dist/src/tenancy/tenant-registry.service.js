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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantRegistryEntity } from '../persistence/entities/index.js';
import { extractSubdomainFromHost } from './tenant-context.js';
let TenantRegistryService = class TenantRegistryService {
    tenantRegistryRepository;
    constructor(tenantRegistryRepository) {
        this.tenantRegistryRepository = tenantRegistryRepository;
    }
    async resolveTenantContext(host) {
        const subdomain = extractSubdomainFromHost(host);
        const tenant = await this.tenantRegistryRepository.findOne({
            where: { subdomain },
        });
        if (!tenant) {
            throw new NotFoundException(`Unknown tenant for subdomain: ${subdomain}`);
        }
        return {
            tenantId: tenant.tenantId,
            subdomain: tenant.subdomain,
            tenantDbName: tenant.tenantDbName,
            tenantDbSecretRef: tenant.tenantDbSecretRef,
            storagePrefix: `emedex-media/${tenant.tenantId}`,
            searchPrefix: `emedex-${tenant.tenantId}`,
        };
    }
};
TenantRegistryService = __decorate([
    Injectable(),
    __param(0, InjectRepository(TenantRegistryEntity)),
    __metadata("design:paramtypes", [Repository])
], TenantRegistryService);
export { TenantRegistryService };
