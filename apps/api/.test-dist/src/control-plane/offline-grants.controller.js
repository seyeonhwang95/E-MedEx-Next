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
import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
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
let OfflineGrantsController = class OfflineGrantsController {
    offlineGrantsService;
    constructor(offlineGrantsService) {
        this.offlineGrantsService = offlineGrantsService;
    }
    listOfflineGrants(query) {
        return this.offlineGrantsService.listOfflineGrants(query);
    }
    listOfflineGrantAuditEvents(grantId, query) {
        return this.offlineGrantsService.listOfflineGrantAuditEvents(grantId, query);
    }
    enrollOfflineGrant(httpRequest, request) {
        return this.offlineGrantsService.enrollOfflineGrant(httpRequest, request);
    }
    validateOfflineGrant(httpRequest, request) {
        const principal = getAuthPrincipalFromRequest(httpRequest);
        this.assertCanAccessGrantWithDeviceScope(principal, request);
        return this.offlineGrantsService.validateOfflineGrant(httpRequest, request);
    }
    acknowledgeOfflineGrantWipe(httpRequest, request) {
        const principal = getAuthPrincipalFromRequest(httpRequest);
        this.assertCanAccessGrantWithDeviceScope(principal, request);
        return this.offlineGrantsService.acknowledgeOfflineGrantWipe(httpRequest, request);
    }
    revokeOfflineGrant(httpRequest, request) {
        return this.offlineGrantsService.revokeOfflineGrant(httpRequest, request);
    }
    assertCanAccessGrantWithDeviceScope(principal, request) {
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
    getDeviceIdClaim(principal) {
        const claim = principal.claims.device_id ?? principal.claims.did;
        if (!claim) {
            return null;
        }
        return String(claim);
    }
};
__decorate([
    Get(),
    Roles(roles.PlatformAdmin),
    ApiOperation({
        summary: 'List offline grants',
        description: 'Retrieve all offline device grants for the control plane. Admin only.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50 }),
    ApiResponse({ status: 200, description: 'List of offline grants' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListOfflineGrantsQueryDto]),
    __metadata("design:returntype", void 0)
], OfflineGrantsController.prototype, "listOfflineGrants", null);
__decorate([
    Get(':grantId/audit-events'),
    Roles(roles.PlatformAdmin),
    ApiOperation({
        summary: 'List offline grant audit events',
        description: 'Retrieve audit events for a specific grant. Supports filtering, sorting, and cursor-based pagination. Admin only.',
    }),
    ApiParam({ name: 'grantId', description: 'The grant ID' }),
    ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' }),
    ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' }),
    ApiQuery({ name: 'from', required: false, description: 'Start date (ISO 8601)' }),
    ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' }),
    ApiQuery({ name: 'sort', required: false, description: 'Sort by field, e.g. eventAt:desc' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'pageSize', required: false, type: Number }),
    ApiQuery({ name: 'cursor', required: false, description: 'Cursor for pagination' }),
    ApiResponse({ status: 200, description: 'Audit events with optional nextCursor' }),
    __param(0, Param('grantId')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ListOfflineGrantAuditEventsQueryDto]),
    __metadata("design:returntype", void 0)
], OfflineGrantsController.prototype, "listOfflineGrantAuditEvents", null);
__decorate([
    Post('enroll'),
    Roles(roles.PlatformAdmin),
    ApiOperation({
        summary: 'Enroll a new offline device grant',
        description: 'Create a new offline device grant for field device use. Admin only.',
    }),
    ApiResponse({ status: 201, description: 'Offline grant enrolled successfully' }),
    ApiResponse({ status: 400, description: 'Invalid request parameters' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, EnrollOfflineGrantDto]),
    __metadata("design:returntype", void 0)
], OfflineGrantsController.prototype, "enrollOfflineGrant", null);
__decorate([
    Post('validate'),
    ApiOperation({
        summary: 'Validate an offline device grant',
        description: 'Validate or refresh an active offline device grant. Admin or device token with matching tenant/user/device claims.',
    }),
    ApiResponse({ status: 201, description: 'Grant validation result' }),
    ApiResponse({ status: 403, description: 'Device token claims do not match request' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ValidateOfflineGrantDto]),
    __metadata("design:returntype", void 0)
], OfflineGrantsController.prototype, "validateOfflineGrant", null);
__decorate([
    Post('ack-wipe'),
    ApiOperation({
        summary: 'Acknowledge offline wipe completion',
        description: 'Acknowledge that offline data wipe has completed on the device. Admin or device token with matching tenant/user/device claims.',
    }),
    ApiResponse({ status: 201, description: 'Wipe acknowledgment result' }),
    ApiResponse({ status: 403, description: 'Device token claims do not match request' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AcknowledgeOfflineGrantWipeDto]),
    __metadata("design:returntype", void 0)
], OfflineGrantsController.prototype, "acknowledgeOfflineGrantWipe", null);
__decorate([
    Post('revoke'),
    Roles(roles.PlatformAdmin),
    ApiOperation({
        summary: 'Revoke an offline device grant',
        description: 'Revoke an offline device grant and trigger wipe requirement. Admin only.',
    }),
    ApiResponse({ status: 201, description: 'Grant revoked successfully' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RevokeOfflineGrantDto]),
    __metadata("design:returntype", void 0)
], OfflineGrantsController.prototype, "revokeOfflineGrant", null);
OfflineGrantsController = __decorate([
    Controller('control/offline-grants'),
    ApiTags('offline-grants'),
    ApiBearerAuth(),
    __metadata("design:paramtypes", [OfflineGrantsService])
], OfflineGrantsController);
export { OfflineGrantsController };
