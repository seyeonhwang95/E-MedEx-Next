import 'reflect-metadata';

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'tenant_registry' })
export class TenantRegistryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', unique: true })
  tenantId!: string;

  @Column({ name: 'subdomain', unique: true })
  subdomain!: string;

  @Column({ name: 'timezone' })
  timezone!: string;

  @Column({ name: 'locale' })
  locale!: string;

  @Column({ name: 'status', default: 'active' })
  status!: string;

  @Column({ name: 'tenant_db_name' })
  tenantDbName!: string;

  @Column({ name: 'tenant_db_secret_ref', type: 'varchar', nullable: true })
  tenantDbSecretRef!: string | null;

  @Column({ name: 'okta_issuer', type: 'varchar', nullable: true })
  oktaIssuer!: string | null;

  @Column({ name: 'okta_audience', type: 'varchar', nullable: true })
  oktaAudience!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'tenant_labs' })
export class TenantLabEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'lab_code' })
  labCode!: string;

  @Column({ name: 'display_name' })
  displayName!: string;

  @Column({ name: 'mllp_host' })
  mllpHost!: string;

  @Column({ name: 'mllp_port', type: 'int' })
  mllpPort!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'config_version', default: '1' })
  configVersion!: string;

  @Column({ name: 'version_no', type: 'int', default: 1 })
  versionNo!: number;

  @Column({ name: 'routing_rules', type: 'jsonb', default: {} })
  routingRules!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity({ name: 'tenant_lab_routing_audits' })
export class TenantLabRoutingAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'resolved_lab_code' })
  resolvedLabCode!: string;

  @Column({ name: 'override_applied', default: false })
  overrideApplied!: boolean;

  @Column({ name: 'override_reason', type: 'text', nullable: true })
  overrideReason!: string | null;

  @Column({ name: 'requested_by', type: 'varchar', nullable: true })
  requestedBy!: string | null;

  @Column({ name: 'request_context', type: 'jsonb' })
  requestContext!: Record<string, unknown>;

  @CreateDateColumn({ name: 'resolved_at', type: 'timestamptz' })
  resolvedAt!: Date;
}

@Entity({ name: 'offline_device_grants' })
export class OfflineDeviceGrantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'grant_id', unique: true })
  grantId!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @Column({ name: 'scope', default: 'FieldIntake' })
  scope!: string;

  @Column({ name: 'status', default: 'active' })
  status!: 'active' | 'revoked' | 'expired';

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'issued_by', type: 'varchar', nullable: true })
  issuedBy!: string | null;

  @Column({ name: 'revoked_by', type: 'varchar', nullable: true })
  revokedBy!: string | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @Column({ name: 'wipe_required', default: false })
  wipeRequired!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}