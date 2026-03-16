var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import 'reflect-metadata';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
let TenantRegistryEntity = class TenantRegistryEntity {
    id;
    tenantId;
    subdomain;
    timezone;
    locale;
    status;
    tenantDbName;
    tenantDbSecretRef;
    oktaIssuer;
    oktaAudience;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], TenantRegistryEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id', unique: true }),
    __metadata("design:type", String)
], TenantRegistryEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'subdomain', unique: true }),
    __metadata("design:type", String)
], TenantRegistryEntity.prototype, "subdomain", void 0);
__decorate([
    Column({ name: 'timezone' }),
    __metadata("design:type", String)
], TenantRegistryEntity.prototype, "timezone", void 0);
__decorate([
    Column({ name: 'locale' }),
    __metadata("design:type", String)
], TenantRegistryEntity.prototype, "locale", void 0);
__decorate([
    Column({ name: 'status', default: 'active' }),
    __metadata("design:type", String)
], TenantRegistryEntity.prototype, "status", void 0);
__decorate([
    Column({ name: 'tenant_db_name' }),
    __metadata("design:type", String)
], TenantRegistryEntity.prototype, "tenantDbName", void 0);
__decorate([
    Column({ name: 'tenant_db_secret_ref', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], TenantRegistryEntity.prototype, "tenantDbSecretRef", void 0);
__decorate([
    Column({ name: 'okta_issuer', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], TenantRegistryEntity.prototype, "oktaIssuer", void 0);
__decorate([
    Column({ name: 'okta_audience', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], TenantRegistryEntity.prototype, "oktaAudience", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TenantRegistryEntity.prototype, "createdAt", void 0);
TenantRegistryEntity = __decorate([
    Entity({ name: 'tenant_registry' })
], TenantRegistryEntity);
export { TenantRegistryEntity };
let TenantLabEntity = class TenantLabEntity {
    id;
    tenantId;
    labCode;
    displayName;
    mllpHost;
    mllpPort;
    isActive;
    configVersion;
    versionNo;
    routingRules;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], TenantLabEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], TenantLabEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'lab_code' }),
    __metadata("design:type", String)
], TenantLabEntity.prototype, "labCode", void 0);
__decorate([
    Column({ name: 'display_name' }),
    __metadata("design:type", String)
], TenantLabEntity.prototype, "displayName", void 0);
__decorate([
    Column({ name: 'mllp_host' }),
    __metadata("design:type", String)
], TenantLabEntity.prototype, "mllpHost", void 0);
__decorate([
    Column({ name: 'mllp_port', type: 'int' }),
    __metadata("design:type", Number)
], TenantLabEntity.prototype, "mllpPort", void 0);
__decorate([
    Column({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], TenantLabEntity.prototype, "isActive", void 0);
__decorate([
    Column({ name: 'config_version', default: '1' }),
    __metadata("design:type", String)
], TenantLabEntity.prototype, "configVersion", void 0);
__decorate([
    Column({ name: 'version_no', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TenantLabEntity.prototype, "versionNo", void 0);
__decorate([
    Column({ name: 'routing_rules', type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], TenantLabEntity.prototype, "routingRules", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TenantLabEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TenantLabEntity.prototype, "updatedAt", void 0);
TenantLabEntity = __decorate([
    Entity({ name: 'tenant_labs' })
], TenantLabEntity);
export { TenantLabEntity };
let TenantLabRoutingAuditEntity = class TenantLabRoutingAuditEntity {
    id;
    tenantId;
    resolvedLabCode;
    overrideApplied;
    overrideReason;
    requestedBy;
    requestContext;
    resolvedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], TenantLabRoutingAuditEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], TenantLabRoutingAuditEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'resolved_lab_code' }),
    __metadata("design:type", String)
], TenantLabRoutingAuditEntity.prototype, "resolvedLabCode", void 0);
__decorate([
    Column({ name: 'override_applied', default: false }),
    __metadata("design:type", Boolean)
], TenantLabRoutingAuditEntity.prototype, "overrideApplied", void 0);
__decorate([
    Column({ name: 'override_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TenantLabRoutingAuditEntity.prototype, "overrideReason", void 0);
__decorate([
    Column({ name: 'requested_by', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], TenantLabRoutingAuditEntity.prototype, "requestedBy", void 0);
__decorate([
    Column({ name: 'request_context', type: 'jsonb' }),
    __metadata("design:type", Object)
], TenantLabRoutingAuditEntity.prototype, "requestContext", void 0);
__decorate([
    CreateDateColumn({ name: 'resolved_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TenantLabRoutingAuditEntity.prototype, "resolvedAt", void 0);
TenantLabRoutingAuditEntity = __decorate([
    Entity({ name: 'tenant_lab_routing_audits' })
], TenantLabRoutingAuditEntity);
export { TenantLabRoutingAuditEntity };
let OfflineDeviceGrantEntity = class OfflineDeviceGrantEntity {
    id;
    grantId;
    tenantId;
    userId;
    deviceId;
    scope;
    status;
    expiresAt;
    issuedBy;
    revokedBy;
    revokedAt;
    wipeRequired;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], OfflineDeviceGrantEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'grant_id', unique: true }),
    __metadata("design:type", String)
], OfflineDeviceGrantEntity.prototype, "grantId", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], OfflineDeviceGrantEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'user_id' }),
    __metadata("design:type", String)
], OfflineDeviceGrantEntity.prototype, "userId", void 0);
__decorate([
    Column({ name: 'device_id' }),
    __metadata("design:type", String)
], OfflineDeviceGrantEntity.prototype, "deviceId", void 0);
__decorate([
    Column({ name: 'scope', default: 'FieldIntake' }),
    __metadata("design:type", String)
], OfflineDeviceGrantEntity.prototype, "scope", void 0);
__decorate([
    Column({ name: 'status', default: 'active' }),
    __metadata("design:type", String)
], OfflineDeviceGrantEntity.prototype, "status", void 0);
__decorate([
    Column({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OfflineDeviceGrantEntity.prototype, "expiresAt", void 0);
__decorate([
    Column({ name: 'issued_by', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], OfflineDeviceGrantEntity.prototype, "issuedBy", void 0);
__decorate([
    Column({ name: 'revoked_by', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], OfflineDeviceGrantEntity.prototype, "revokedBy", void 0);
__decorate([
    Column({ name: 'revoked_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OfflineDeviceGrantEntity.prototype, "revokedAt", void 0);
__decorate([
    Column({ name: 'wipe_required', default: false }),
    __metadata("design:type", Boolean)
], OfflineDeviceGrantEntity.prototype, "wipeRequired", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OfflineDeviceGrantEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OfflineDeviceGrantEntity.prototype, "updatedAt", void 0);
OfflineDeviceGrantEntity = __decorate([
    Entity({ name: 'offline_device_grants' })
], OfflineDeviceGrantEntity);
export { OfflineDeviceGrantEntity };
