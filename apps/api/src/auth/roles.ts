export const roles = {
  PlatformAdmin: 'platform_admin',
  TenantAdmin: 'tenant_admin',
  Investigator: 'investigator',
  Pathologist: 'pathologist',
  LabReviewer: 'lab_reviewer',
  FieldIntake: 'field_intake',
} as const;

export type Role = (typeof roles)[keyof typeof roles];