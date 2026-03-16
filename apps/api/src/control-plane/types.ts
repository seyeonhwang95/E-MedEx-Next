export type TenantStatus = 'active' | 'suspended' | 'disabled';

export type CreateTenantRequest = {
  tenantId: string;
  subdomain: string;
  timezone: string;
  locale: string;
  status: TenantStatus;
  tenantDbName: string;
  tenantDbSecretRef?: string;
  oktaIssuer?: string;
  oktaAudience?: string;
};

export type TenantRegistryRecord = {
  tenantId: string;
  subdomain: string;
  timezone: string;
  locale: string;
  status: TenantStatus;
  tenantDbName: string;
  tenantDbSecretRef: string | null;
  oktaIssuer: string | null;
  oktaAudience: string | null;
  createdAt: string;
};

export type TenantLabRoutingRules = {
  testTypes?: string[];
  specimenTypes?: string[];
  caseTypes?: string[];
  agencies?: string[];
  priorityOnly?: boolean;
  priority?: number;
};

export type UpsertTenantLabRequest = {
  displayName: string;
  mllpHost: string;
  mllpPort: number;
  isActive: boolean;
  routingRules?: TenantLabRoutingRules;
};

export type TenantLabRecord = {
  tenantId: string;
  labCode: string;
  displayName: string;
  mllpHost: string;
  mllpPort: number;
  isActive: boolean;
  configVersion: string;
  versionNo: number;
  routingRules: TenantLabRoutingRules;
  createdAt: string;
  updatedAt: string;
};

export type ResolveTenantLabRequest = {
  testType?: string;
  specimenType?: string;
  caseType?: string;
  agency?: string;
  priority?: boolean;
  overrideLabCode?: string;
  overrideReason?: string;
};

export type ResolveTenantLabResult = {
  tenantId: string;
  selectedLabCode: string;
  reason: string;
  overrideApplied: boolean;
  configVersion: string;
};

export type OfflineGrantScope = 'FieldIntake';

export type EnrollOfflineGrantRequest = {
  tenantId: string;
  userId: string;
  deviceId: string;
  scope?: OfflineGrantScope;
  ttlHours?: number;
  issuedBy?: string;
};

export type ValidateOfflineGrantRequest = {
  grantId: string;
  tenantId: string;
  userId: string;
  deviceId: string;
  scope?: OfflineGrantScope;
};

export type RevokeOfflineGrantRequest = {
  grantId: string;
  tenantId: string;
  userId: string;
  deviceId: string;
  revokedBy?: string;
};

export type AcknowledgeOfflineGrantWipeRequest = {
  grantId: string;
  tenantId: string;
  userId: string;
  deviceId: string;
  scope?: OfflineGrantScope;
};

export type OfflineGrantRecord = {
  grantId: string;
  tenantId: string;
  userId: string;
  deviceId: string;
  scope: OfflineGrantScope;
  status: 'active' | 'revoked' | 'expired';
  expiresAt: string;
  issuedBy: string | null;
  revokedBy: string | null;
  revokedAt: string | null;
  wipeRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ValidateOfflineGrantResult = {
  valid: boolean;
  reason: 'OK' | 'NOT_FOUND' | 'REVOKED' | 'EXPIRED';
  wipeRequired: boolean;
  grant: OfflineGrantRecord | null;
};

export type AcknowledgeOfflineGrantWipeResult = {
  acknowledged: boolean;
  reason: 'OK' | 'NOT_FOUND' | 'NOT_REVOKED';
  grant: OfflineGrantRecord | null;
};