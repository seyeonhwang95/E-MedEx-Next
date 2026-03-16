import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { apiErrorCodes } from '../common/api-error-codes.js';
import { TenantLabEntity, TenantLabRoutingAuditEntity, TenantRegistryEntity } from '../persistence/entities/index.js';

import type {
  CreateTenantRequest,
  ResolveTenantLabRequest,
  ResolveTenantLabResult,
  TenantLabRecord,
  TenantLabRoutingRules,
  TenantRegistryRecord,
  UpsertTenantLabRequest,
} from './types.js';

@Injectable()
export class TenantProvisioningService {
  constructor(
    @InjectRepository(TenantRegistryEntity)
    private readonly tenantRegistryRepository: Repository<TenantRegistryEntity>,
    @InjectRepository(TenantLabEntity)
    private readonly tenantLabRepository: Repository<TenantLabEntity>,
    @InjectRepository(TenantLabRoutingAuditEntity)
    private readonly tenantLabRoutingAuditRepository: Repository<TenantLabRoutingAuditEntity>,
  ) {}

  async listTenants(): Promise<TenantRegistryRecord[]> {
    const tenants = await this.tenantRegistryRepository.find({
      order: { createdAt: 'DESC' },
    });

    return tenants.map((tenant) => this.toRecord(tenant));
  }

  async createTenant(request: CreateTenantRequest): Promise<TenantRegistryRecord> {
    const tenantId = request.tenantId.toLowerCase();
    const createdTenant = this.tenantRegistryRepository.create({
      tenantId,
      subdomain: request.subdomain.toLowerCase(),
      timezone: request.timezone,
      locale: request.locale,
      status: request.status,
      tenantDbName: request.tenantDbName,
      tenantDbSecretRef: request.tenantDbSecretRef ?? null,
      oktaIssuer: request.oktaIssuer ?? null,
      oktaAudience: request.oktaAudience ?? null,
    });

    const savedTenant = await this.tenantRegistryRepository.save(createdTenant);

    return this.toRecord(savedTenant);
  }

  async listTenantLabs(tenantId: string): Promise<TenantLabRecord[]> {
    const normalizedTenantId = tenantId.toLowerCase();
    const labs = await this.tenantLabRepository.find({
      where: { tenantId: normalizedTenantId },
      order: { createdAt: 'DESC' },
    });

    return labs.map((lab) => this.toLabRecord(lab));
  }

  async upsertTenantLab(tenantId: string, labCode: string, request: UpsertTenantLabRequest): Promise<TenantLabRecord> {
    const normalizedTenantId = tenantId.toLowerCase();
    const normalizedLabCode = labCode.toUpperCase();

    const existing = await this.tenantLabRepository.findOne({
      where: {
        tenantId: normalizedTenantId,
        labCode: normalizedLabCode,
      },
    });

    const nextVersionNo = existing ? existing.versionNo + 1 : 1;
    const nextConfigVersion = String(nextVersionNo);

    const saved = await this.tenantLabRepository.save(
      this.tenantLabRepository.create({
        ...(existing ?? {}),
        tenantId: normalizedTenantId,
        labCode: normalizedLabCode,
        displayName: request.displayName,
        mllpHost: request.mllpHost,
        mllpPort: request.mllpPort,
        isActive: request.isActive,
        routingRules: request.routingRules ?? {},
        versionNo: nextVersionNo,
        configVersion: nextConfigVersion,
      }),
    );

    return this.toLabRecord(saved);
  }

  async resolveTenantLab(tenantId: string, request: ResolveTenantLabRequest): Promise<ResolveTenantLabResult> {
    const normalizedTenantId = tenantId.toLowerCase();
    const activeLabs = await this.tenantLabRepository.find({
      where: {
        tenantId: normalizedTenantId,
        isActive: true,
      },
      order: { createdAt: 'ASC' },
    });

    if (activeLabs.length === 0) {
      throw new NotFoundException(`No active labs configured for tenant: ${normalizedTenantId}`);
    }

    let selected = activeLabs[0];
    let reason = 'Default first active lab';
    let overrideApplied = false;

    if (request.overrideLabCode) {
      const overrideLabCode = request.overrideLabCode.toUpperCase();
      const overrideLab = activeLabs.find((lab) => lab.labCode === overrideLabCode);
      if (!overrideLab) {
        throw new BadRequestException({
          code: apiErrorCodes.LabOverrideNotAvailable,
          message: `Override lab not active or not found: ${request.overrideLabCode}`,
        });
      }

      selected = overrideLab;
      reason = request.overrideReason?.trim() ? request.overrideReason : 'Manual override';
      overrideApplied = true;
    } else {
      const candidates = activeLabs
        .map((lab) => ({
          lab,
          score: this.scoreLabRules((lab.routingRules ?? {}) as TenantLabRoutingRules, request),
        }))
        .filter((item) => item.score >= 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }

          return left.lab.labCode.localeCompare(right.lab.labCode);
        });

      if (candidates.length > 0) {
        selected = candidates[0].lab;
        reason = candidates[0].score > 0 ? 'Matched routing rules' : 'No routing criteria matched, fallback to deterministic lab order';
      }
    }

    await this.tenantLabRoutingAuditRepository.save(
      this.tenantLabRoutingAuditRepository.create({
        tenantId: normalizedTenantId,
        resolvedLabCode: selected.labCode,
        overrideApplied,
        overrideReason: request.overrideReason ?? null,
        requestedBy: null,
        requestContext: {
          testType: request.testType ?? null,
          specimenType: request.specimenType ?? null,
          caseType: request.caseType ?? null,
          agency: request.agency ?? null,
          priority: request.priority ?? false,
        },
      }),
    );

    return {
      tenantId: normalizedTenantId,
      selectedLabCode: selected.labCode,
      reason,
      overrideApplied,
      configVersion: selected.configVersion,
    };
  }

  private scoreLabRules(rules: TenantLabRoutingRules, request: ResolveTenantLabRequest): number {
    let score = 0;

    if (rules.priorityOnly && !request.priority) {
      return -1;
    }

    if (rules.testTypes?.length) {
      if (!request.testType || !rules.testTypes.includes(request.testType)) {
        return -1;
      }
      score += 4;
    }

    if (rules.specimenTypes?.length) {
      if (!request.specimenType || !rules.specimenTypes.includes(request.specimenType)) {
        return -1;
      }
      score += 3;
    }

    if (rules.caseTypes?.length) {
      if (!request.caseType || !rules.caseTypes.includes(request.caseType)) {
        return -1;
      }
      score += 3;
    }

    if (rules.agencies?.length) {
      if (!request.agency || !rules.agencies.includes(request.agency)) {
        return -1;
      }
      score += 2;
    }

    if (request.priority && rules.priorityOnly) {
      score += 1;
    }

    score += rules.priority ?? 0;
    return score;
  }

  private toRecord(entity: TenantRegistryEntity): TenantRegistryRecord {
    return {
      tenantId: entity.tenantId,
      subdomain: entity.subdomain,
      timezone: entity.timezone,
      locale: entity.locale,
      status: entity.status as TenantRegistryRecord['status'],
      tenantDbName: entity.tenantDbName,
      tenantDbSecretRef: entity.tenantDbSecretRef,
      oktaIssuer: entity.oktaIssuer,
      oktaAudience: entity.oktaAudience,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  private toLabRecord(entity: TenantLabEntity): TenantLabRecord {
    return {
      tenantId: entity.tenantId,
      labCode: entity.labCode,
      displayName: entity.displayName,
      mllpHost: entity.mllpHost,
      mllpPort: entity.mllpPort,
      isActive: entity.isActive,
      configVersion: entity.configVersion,
      versionNo: entity.versionNo,
      routingRules: (entity.routingRules ?? {}) as TenantLabRoutingRules,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}