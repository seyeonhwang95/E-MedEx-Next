import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { TenantRegistryService } from './tenant-registry.service.js';
import { resolveTenantFromHost } from './tenant-context.js';
import type { TenantContext } from './tenant-context.js';

type TenantAwareRequest = Request & {
  tenant?: TenantContext;
};

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private readonly tenantRegistryService: TenantRegistryService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    let tenant: TenantContext;

    try {
      tenant = await this.tenantRegistryService.resolveTenantContext(req.headers.host);
    } catch {
      tenant = resolveTenantFromHost(req.headers.host);
    }

    const tenantAwareRequest = req as TenantAwareRequest;

    tenantAwareRequest.tenant = tenant;
    req.headers['x-tenant-id'] = tenant.tenantId;

    next();
  }
}