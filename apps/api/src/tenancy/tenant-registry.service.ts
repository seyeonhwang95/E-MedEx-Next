import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenantRegistryEntity } from '../persistence/entities/index.js';
import { extractSubdomainFromHost } from './tenant-context.js';
import type { TenantContext } from './tenant-context.js';

@Injectable()
export class TenantRegistryService {
  constructor(
    @InjectRepository(TenantRegistryEntity)
    private readonly tenantRegistryRepository: Repository<TenantRegistryEntity>,
  ) {}

  async resolveTenantContext(host?: string): Promise<TenantContext> {
    const subdomain = extractSubdomainFromHost(host);

    const tenant = await this.tenantRegistryRepository.findOne({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException(`Unknown tenant for subdomain: ${subdomain}`);
    }

    return {
      tenantId: tenant.tenantId,
      subdomain: tenant.subdomain,
      tenantDbName: tenant.tenantDbName,
      tenantDbSecretRef: tenant.tenantDbSecretRef,
      storagePrefix: `emedex-media/${tenant.tenantId}`,
      searchPrefix: `emedex-${tenant.tenantId}`,
    };
  }
}