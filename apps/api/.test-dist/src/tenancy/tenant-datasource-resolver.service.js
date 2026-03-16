var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditEventEntity, CaseEntity, CaseReportEntity, CremationCaseEntity, CustodyEventEntity, EvidenceItemEntity, Hl7MessageEntity, Hl7UnmatchedResultEntity, IndigentCaseEntity, InvestigationEntity, LabOrderEntity, LabResultEntity, MediaAssetEntity, OfflineAuditEventEntity, OfflineSyncSessionEntity, PoliceHoldEntity, ProtocolVersionEntity, ReferenceAgencyEntity, ReferenceCaseTypeEntity, } from '../persistence/entities/tenant-data.entity.js';
let TenantDataSourceResolverService = class TenantDataSourceResolverService {
    dataSourcesByTenantId = new Map();
    async getCaseRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(CaseEntity);
    }
    async getLabOrderRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(LabOrderEntity);
    }
    async getHl7MessageRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(Hl7MessageEntity);
    }
    async getInvestigationRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(InvestigationEntity);
    }
    async getPoliceHoldRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(PoliceHoldEntity);
    }
    async getAuditEventRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(AuditEventEntity);
    }
    async getEvidenceItemRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(EvidenceItemEntity);
    }
    async getCustodyEventRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(CustodyEventEntity);
    }
    async getMediaAssetRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(MediaAssetEntity);
    }
    async getProtocolVersionRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(ProtocolVersionEntity);
    }
    async getCremationCaseRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(CremationCaseEntity);
    }
    async getIndigentCaseRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(IndigentCaseEntity);
    }
    async getReferenceAgencyRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(ReferenceAgencyEntity);
    }
    async getReferenceCaseTypeRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(ReferenceCaseTypeEntity);
    }
    async getHl7UnmatchedResultRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(Hl7UnmatchedResultEntity);
    }
    async getCaseReportRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(CaseReportEntity);
    }
    async getOfflineSyncSessionRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(OfflineSyncSessionEntity);
    }
    async getOfflineAuditEventRepository(context) {
        const dataSource = await this.getTenantDataSource(context);
        return dataSource.getRepository(OfflineAuditEventEntity);
    }
    async assignCanonicalCaseNumber(context, prefix, caseYear) {
        const dataSource = await this.getTenantDataSource(context);
        const rows = (await dataSource.query('SELECT assign_canonical_case_number($1, $2, $3) AS canonical_case_number', [context.tenantId, prefix, caseYear]));
        return rows[0]?.canonical_case_number ?? '';
    }
    async getTenantDataSource(context) {
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
    async onModuleDestroy() {
        for (const dataSource of this.dataSourcesByTenantId.values()) {
            if (dataSource.isInitialized) {
                await dataSource.destroy();
            }
        }
    }
};
TenantDataSourceResolverService = __decorate([
    Injectable()
], TenantDataSourceResolverService);
export { TenantDataSourceResolverService };
