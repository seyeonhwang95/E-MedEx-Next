import 'reflect-metadata';

import { DataSource } from 'typeorm';

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
} from './entities/index.js';
import { InitTenantData1710600001000 } from './migrations/1710600001000-init-tenant-data.js';
import { FunctionalCore1710600002000 } from './migrations/1710600002000-functional-core.js';
import { ReportingWorkflow1710600004000 } from './migrations/1710600004000-reporting-workflow.js';

export const tenantDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TENANT_DB_HOST ?? 'localhost',
  port: Number(process.env.TENANT_DB_PORT ?? 5433),
  username: process.env.TENANT_DB_USER ?? 'postgres',
  password: process.env.TENANT_DB_PASSWORD ?? 'postgres',
  database: process.env.TENANT_DB_NAME ?? 'emedex_demo',
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
  migrations: [InitTenantData1710600001000, FunctionalCore1710600002000, ReportingWorkflow1710600004000],
  synchronize: false,
});

export default tenantDataSource;