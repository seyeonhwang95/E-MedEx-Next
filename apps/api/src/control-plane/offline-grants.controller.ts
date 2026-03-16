import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthPrincipal } from '../auth/auth-principal.js';
import { Roles } from '../auth/roles.decorator.js';
import { roles } from '../auth/roles.js';
import { getAuthPrincipalFromRequest } from '../tenancy/request-context.js';
import { AcknowledgeOfflineGrantWipeDto } from './dto/acknowledge-offline-grant-wipe.dto.js';
import { EnrollOfflineGrantDto } from './dto/enroll-offline-grant.dto.js';
import { ListOfflineGrantAuditEventsQueryDto } from './dto/list-offline-grant-audit-events-query.dto.js';
import { ListOfflineGrantsQueryDto } from './dto/list-offline-grants-query.dto.js';
import { RevokeOfflineGrantDto } from './dto/revoke-offline-grant.dto.js';
import { ValidateOfflineGrantDto } from './dto/validate-offline-grant.dto.js';
import { OfflineGrantsService } from './offline-grants.service.js';

@Controller('control/offline-grants')
@ApiTags('offline-grants')
@ApiBearerAuth()
export class OfflineGrantsController {
  constructor(private readonly offlineGrantsService: OfflineGrantsService) {}

  @Get()
  @Roles(roles.PlatformAdmin)
  @ApiOperation({
    summary: 'List offline grants',
    description: 'Retrieve all offline device grants for the control plane. Admin only.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'List of offline grants' })
  listOfflineGrants(@Query() query: ListOfflineGrantsQueryDto) {
    return this.offlineGrantsService.listOfflineGrants(query);
  }

  @Get(':grantId/audit-events')
  @Roles(roles.PlatformAdmin)
  @ApiOperation({
    summary: 'List offline grant audit events',
    description: 'Retrieve audit events for a specific grant. Supports filtering, sorting, and cursor-based pagination. Admin only.',
  })
  @ApiParam({ name: 'grantId', description: 'The grant ID' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort by field, e.g. eventAt:desc' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor for pagination' })
  @ApiResponse({ status: 200, description: 'Audit events with optional nextCursor' })
  listOfflineGrantAuditEvents(@Param('grantId') grantId: string, @Query() query: ListOfflineGrantAuditEventsQueryDto) {
    return this.offlineGrantsService.listOfflineGrantAuditEvents(grantId, query);
  }

  @Post('enroll')
  @Roles(roles.PlatformAdmin)
  @ApiOperation({
    summary: 'Enroll a new offline device grant',
    description: 'Create a new offline device grant for field device use. Admin only.',
  })
  @ApiResponse({ status: 201, description: 'Offline grant enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  enrollOfflineGrant(@Req() httpRequest: Request, @Body() request: EnrollOfflineGrantDto) {
    return this.offlineGrantsService.enrollOfflineGrant(httpRequest, request);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate an offline device grant',
    description: 'Validate or refresh an active offline device grant. Admin or device token with matching tenant/user/device claims.',
  })
  @ApiResponse({ status: 201, description: 'Grant validation result' })
  @ApiResponse({ status: 403, description: 'Device token claims do not match request' })
  validateOfflineGrant(@Req() httpRequest: Request, @Body() request: ValidateOfflineGrantDto) {
    const principal = getAuthPrincipalFromRequest(httpRequest);
    this.assertCanAccessGrantWithDeviceScope(principal, request);
    return this.offlineGrantsService.validateOfflineGrant(httpRequest, request);
  }

  @Post('ack-wipe')
  @ApiOperation({
    summary: 'Acknowledge offline wipe completion',
    description: 'Acknowledge that offline data wipe has completed on the device. Admin or device token with matching tenant/user/device claims.',
  })
  @ApiResponse({ status: 201, description: 'Wipe acknowledgment result' })
  @ApiResponse({ status: 403, description: 'Device token claims do not match request' })
  acknowledgeOfflineGrantWipe(@Req() httpRequest: Request, @Body() request: AcknowledgeOfflineGrantWipeDto) {
    const principal = getAuthPrincipalFromRequest(httpRequest);
    this.assertCanAccessGrantWithDeviceScope(principal, request);
    return this.offlineGrantsService.acknowledgeOfflineGrantWipe(httpRequest, request);
  }

  @Post('revoke')
  @Roles(roles.PlatformAdmin)
  @ApiOperation({
    summary: 'Revoke an offline device grant',
    description: 'Revoke an offline device grant and trigger wipe requirement. Admin only.',
  })
  @ApiResponse({ status: 201, description: 'Grant revoked successfully' })
  revokeOfflineGrant(@Req() httpRequest: Request, @Body() request: RevokeOfflineGrantDto) {
    return this.offlineGrantsService.revokeOfflineGrant(httpRequest, request);
  }

  private assertCanAccessGrantWithDeviceScope(
    principal: AuthPrincipal,
    request: { tenantId: string; userId: string; deviceId: string },
  ): void {
    if (principal.roles.includes(roles.PlatformAdmin)) {
      return;
    }

    const normalizedTenantId = request.tenantId.toLowerCase();
    const principalTenantId = principal.tenantId?.toLowerCase();
    const deviceIdClaim = this.getDeviceIdClaim(principal);

    if (!principalTenantId || principalTenantId !== normalizedTenantId) {
      throw new ForbiddenException('Device token tenant does not match offline grant tenant');
    }

    if (principal.subject !== request.userId) {
      throw new ForbiddenException('Device token subject does not match offline grant user');
    }

    if (!deviceIdClaim || deviceIdClaim !== request.deviceId) {
      throw new ForbiddenException('Device token device identifier does not match offline grant device');
    }
  }

  private getDeviceIdClaim(principal: AuthPrincipal): string | null {
    const claim = principal.claims.device_id ?? principal.claims.did;
    if (!claim) {
      return null;
    }

    return String(claim);
  }
}