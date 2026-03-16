var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PUBLIC_ROUTE_METADATA_KEY } from './public.decorator.js';
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublicRoute = this.reflector.getAllAndOverride(PUBLIC_ROUTE_METADATA_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublicRoute) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractBearerToken(request.headers.authorization);
        if (!token) {
            throw new UnauthorizedException('Missing bearer token');
        }
        const authMode = (process.env.AUTH_MODE ?? 'dev').toLowerCase();
        try {
            request.auth = authMode === 'okta' ? await this.verifyOktaToken(token) : await this.verifyDevToken(token);
        }
        catch {
            throw new UnauthorizedException('Invalid or expired bearer token');
        }
        return true;
    }
    extractBearerToken(authorization) {
        if (!authorization) {
            return null;
        }
        const [scheme, value] = authorization.split(' ');
        if (scheme?.toLowerCase() !== 'bearer' || !value) {
            return null;
        }
        return value;
    }
    async verifyDevToken(token) {
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
    async verifyOktaToken(token) {
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
    toPrincipal(payload) {
        const rolesFromPayload = this.extractRoles(payload.roles) ?? this.extractRoles(payload.groups) ?? [];
        return {
            subject: String(payload.sub ?? 'unknown'),
            tenantId: payload.tenant_id ? String(payload.tenant_id) : payload.tid ? String(payload.tid) : undefined,
            roles: rolesFromPayload,
            claims: payload,
        };
    }
    extractRoles(value) {
        if (!Array.isArray(value)) {
            return null;
        }
        return value.map((item) => String(item));
    }
};
JwtAuthGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], JwtAuthGuard);
export { JwtAuthGuard };
