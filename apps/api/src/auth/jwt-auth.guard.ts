import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import type { AuthPrincipal } from './auth-principal.js';
import { PUBLIC_ROUTE_METADATA_KEY } from './public.decorator.js';

type RequestWithAuth = {
  headers: Record<string, string | undefined>;
  auth?: AuthPrincipal;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const authMode = (process.env.AUTH_MODE ?? 'dev').toLowerCase();
    try {
      request.auth = authMode === 'okta' ? await this.verifyOktaToken(token) : await this.verifyDevToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired bearer token');
    }

    return true;
  }

  private extractBearerToken(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }

    const [scheme, value] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !value) {
      return null;
    }

    return value;
  }

  private async verifyDevToken(token: string): Promise<AuthPrincipal> {
    const issuer = process.env.DEV_JWT_ISSUER ?? 'emedex-dev';
    const audience = process.env.DEV_JWT_AUDIENCE ?? 'emedex-api';
    const secret = process.env.DEV_JWT_SECRET ?? 'dev-local-secret-change-me';
    const encodedSecret = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, encodedSecret, {
      issuer,
      audience,
      algorithms: ['HS256'],
      clockTolerance: Number(process.env.JWT_CLOCK_SKEW_SECONDS ?? 30),
    });

    return this.toPrincipal(payload);
  }

  private async verifyOktaToken(token: string): Promise<AuthPrincipal> {
    const issuer = process.env.OKTA_ISSUER;
    const audience = process.env.OKTA_AUDIENCE;

    if (!issuer || !audience) {
      throw new UnauthorizedException('Missing OKTA_ISSUER or OKTA_AUDIENCE');
    }

    const jwksUri = process.env.OKTA_JWKS_URI ?? `${issuer.replace(/\/$/, '')}/v1/keys`;
    const allowedAlgorithms = (process.env.JWT_ALLOWED_ALGS ?? 'RS256')
      .split(',')
      .map((algorithm) => algorithm.trim())
      .filter(Boolean);
    const jwks = createRemoteJWKSet(new URL(jwksUri));

    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
      algorithms: allowedAlgorithms,
      clockTolerance: Number(process.env.JWT_CLOCK_SKEW_SECONDS ?? 30),
    });

    return this.toPrincipal(payload);
  }

  private toPrincipal(payload: Record<string, unknown>): AuthPrincipal {
    const rolesFromPayload = this.extractRoles(payload.roles) ?? this.extractRoles(payload.groups) ?? [];

    return {
      subject: String(payload.sub ?? 'unknown'),
      tenantId: payload.tenant_id ? String(payload.tenant_id) : payload.tid ? String(payload.tid) : undefined,
      roles: rolesFromPayload,
      claims: payload,
    };
  }

  private extractRoles(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
      return null;
    }

    return value.map((item) => String(item));
  }
}