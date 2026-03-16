import { UnauthorizedException } from '@nestjs/common';
export function getTenantContextFromRequest(request) {
    const contextRequest = request;
    if (!contextRequest.tenant) {
        throw new UnauthorizedException('Tenant context is missing from request');
    }
    return contextRequest.tenant;
}
export function getAuthPrincipalFromRequest(request) {
    const contextRequest = request;
    if (!contextRequest.auth) {
        throw new UnauthorizedException('Authentication principal missing from request');
    }
    return contextRequest.auth;
}
