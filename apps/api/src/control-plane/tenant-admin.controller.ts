import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';

import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { ResolveTenantLabDto } from './dto/resolve-tenant-lab.dto.js';
import { UpsertTenantLabDto } from './dto/upsert-tenant-lab.dto.js';
import { TenantProvisioningService } from './tenant-provisioning.service.js';
import type { CreateTenantRequest } from './types.js';

@Controller('control/tenants')
export class TenantAdminController {
  constructor(private readonly tenantProvisioningService: TenantProvisioningService) {}

  @Get()
  @Roles(roles.PlatformAdmin)
  listTenants() {
    return this.tenantProvisioningService.listTenants();
  }

  @Post()
  @Roles(roles.PlatformAdmin)
  createTenant(@Body() request: CreateTenantRequest) {
    return this.tenantProvisioningService.createTenant(request);
  }

  @Get(':tenantId/labs')
  @Roles(roles.PlatformAdmin)
  listTenantLabs(@Param('tenantId') tenantId: string) {
    return this.tenantProvisioningService.listTenantLabs(tenantId);
  }

  @Put(':tenantId/labs/:labCode')
  @Roles(roles.PlatformAdmin)
  upsertTenantLab(
    @Param('tenantId') tenantId: string,
    @Param('labCode') labCode: string,
    @Body() request: UpsertTenantLabDto,
  ) {
    return this.tenantProvisioningService.upsertTenantLab(tenantId, labCode, request);
  }

  @Post(':tenantId/labs/resolve')
  @Roles(roles.PlatformAdmin)
  resolveTenantLab(@Param('tenantId') tenantId: string, @Body() request: ResolveTenantLabDto) {
    return this.tenantProvisioningService.resolveTenantLab(tenantId, request);
  }
}