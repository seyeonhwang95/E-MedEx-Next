import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';

import {
  AuditEventEntity,
  CaseEntity,
  CaseReportEntity,
  CremationCaseEntity,
  CustodyEventEntity,
  EvidenceItemEntity,
  Hl7MessageEntity,
  Hl7UnmatchedResultEntity,
  IndigentCaseEntity,
  InvestigationEntity,
  LabOrderEntity,
  LabResultEntity,
  MediaAssetEntity,
  OfflineAuditEventEntity,
  OfflineSyncSessionEntity,
  PoliceHoldEntity,
  ProtocolVersionEntity,
  ReferenceAgencyEntity,
  ReferenceCaseTypeEntity,
} from '../persistence/entities/tenant-data.entity.js';
import type { TenantContext } from './tenant-context.js';

@Injectable()
export class TenantDataSourceResolverService implements OnModuleDestroy {
  private readonly dataSourcesByTenantId = new Map<string, DataSource>();

  async getCaseRepository(context: TenantContext): Promise<Repository<CaseEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(CaseEntity);
  }

  async getLabOrderRepository(context: TenantContext): Promise<Repository<LabOrderEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(LabOrderEntity);
  }

  async getHl7MessageRepository(context: TenantContext): Promise<Repository<Hl7MessageEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(Hl7MessageEntity);
  }

  async getInvestigationRepository(context: TenantContext): Promise<Repository<InvestigationEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(InvestigationEntity);
  }

  async getPoliceHoldRepository(context: TenantContext): Promise<Repository<PoliceHoldEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(PoliceHoldEntity);
  }

  async getAuditEventRepository(context: TenantContext): Promise<Repository<AuditEventEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(AuditEventEntity);
  }

  async getEvidenceItemRepository(context: TenantContext): Promise<Repository<EvidenceItemEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(EvidenceItemEntity);
  }

  async getCustodyEventRepository(context: TenantContext): Promise<Repository<CustodyEventEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(CustodyEventEntity);
  }

  async getMediaAssetRepository(context: TenantContext): Promise<Repository<MediaAssetEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(MediaAssetEntity);
  }

  async getProtocolVersionRepository(context: TenantContext): Promise<Repository<ProtocolVersionEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(ProtocolVersionEntity);
  }

  async getCremationCaseRepository(context: TenantContext): Promise<Repository<CremationCaseEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(CremationCaseEntity);
  }

  async getIndigentCaseRepository(context: TenantContext): Promise<Repository<IndigentCaseEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(IndigentCaseEntity);
  }

  async getReferenceAgencyRepository(context: TenantContext): Promise<Repository<ReferenceAgencyEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(ReferenceAgencyEntity);
  }

  async getReferenceCaseTypeRepository(context: TenantContext): Promise<Repository<ReferenceCaseTypeEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(ReferenceCaseTypeEntity);
  }

  async getHl7UnmatchedResultRepository(context: TenantContext): Promise<Repository<Hl7UnmatchedResultEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(Hl7UnmatchedResultEntity);
  }

  async getCaseReportRepository(context: TenantContext): Promise<Repository<CaseReportEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(CaseReportEntity);
  }

  async getOfflineSyncSessionRepository(context: TenantContext): Promise<Repository<OfflineSyncSessionEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(OfflineSyncSessionEntity);
  }

  async getOfflineAuditEventRepository(context: TenantContext): Promise<Repository<OfflineAuditEventEntity>> {
    const dataSource = await this.getTenantDataSource(context);
    return dataSource.getRepository(OfflineAuditEventEntity);
  }

  async assignCanonicalCaseNumber(context: TenantContext, prefix: string, caseYear: number): Promise<string> {
    const dataSource = await this.getTenantDataSource(context);
    const rows = (await dataSource.query(
      'SELECT assign_canonical_case_number($1, $2, $3) AS canonical_case_number',
      [context.tenantId, prefix, caseYear],
    )) as Array<{ canonical_case_number: string }>;

    return rows[0]?.canonical_case_number ?? '';
  }

  async getTenantDataSource(context: TenantContext): Promise<DataSource> {
    const cached = this.dataSourcesByTenantId.get(context.tenantId);
    if (cached?.isInitialized) {
      return cached;
    }

    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.TENANT_DB_HOST ?? 'localhost',
      port: Number(process.env.TENANT_DB_PORT ?? 5433),
      username: process.env.TENANT_DB_USER ?? 'postgres',
      password: process.env.TENANT_DB_PASSWORD ?? 'postgres',
      database: context.tenantDbName,
      entities: [
        CaseEntity,
        CaseReportEntity,
        OfflineSyncSessionEntity,
        OfflineAuditEventEntity,
        Hl7MessageEntity,
        LabOrderEntity,
        LabResultEntity,
        InvestigationEntity,
        PoliceHoldEntity,
        AuditEventEntity,
        EvidenceItemEntity,
        CustodyEventEntity,
        MediaAssetEntity,
        ProtocolVersionEntity,
        CremationCaseEntity,
        IndigentCaseEntity,
        ReferenceAgencyEntity,
        ReferenceCaseTypeEntity,
        Hl7UnmatchedResultEntity,
      ],
      synchronize: false,
    });

    await dataSource.initialize();
    this.dataSourcesByTenantId.set(context.tenantId, dataSource);

    return dataSource;
  }

  async onModuleDestroy(): Promise<void> {
    for (const dataSource of this.dataSourcesByTenantId.values()) {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  }
}