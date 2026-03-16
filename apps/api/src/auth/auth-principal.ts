import type { JWTPayload } from 'jose';

export type AuthPrincipal = {
  subject: string;
  tenantId?: string;
  roles: string[];
  claims: JWTPayload;
};