import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthPrincipal } from './auth-principal.js';
import { ROLES_METADATA_KEY } from './roles.decorator.js';
import type { Role } from './roles.js';

type RequestWithRoles = {
  headers: Record<string, string | undefined>;
  auth?: AuthPrincipal;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithRoles>();
    const authenticatedRoles = request.auth?.roles ?? [];
    const roleHeader = request.headers['x-roles'] ?? '';
    const headerRoles = roleHeader
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const roleSet = new Set(
      [...authenticatedRoles, ...headerRoles].map((value) => value.trim()).filter(Boolean),
    );

    return requiredRoles.every((role) => roleSet.has(role));
  }
}