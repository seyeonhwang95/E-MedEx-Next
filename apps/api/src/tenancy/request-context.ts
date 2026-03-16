import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthPrincipal } from '../auth/auth-principal.js';
import type { TenantContext } from './tenant-context.js';

type RequestWithContext = Request & {
  tenant?: TenantContext;
  auth?: AuthPrincipal;
};

export function getTenantContextFromRequest(request: Request): TenantContext {
  const contextRequest = request as RequestWithContext;

  if (!contextRequest.tenant) {
    throw new UnauthorizedException('Tenant context is missing from request');
  }

  return contextRequest.tenant;
}

export function getAuthPrincipalFromRequest(request: Request): AuthPrincipal {
  const contextRequest = request as RequestWithContext;

  if (!contextRequest.auth) {
    throw new UnauthorizedException('Authentication principal missing from request');
  }

  return contextRequest.auth;
}