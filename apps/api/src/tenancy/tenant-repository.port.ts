import type { TenantContext } from './tenant-context.js';

export type RepositoryLike<T> = {
  create(input: Partial<T>): T;
  save(input: Partial<T>): Promise<T>;
  findOne(options: { where?: Partial<T> }): Promise<T | null>;
  findAndCount(options?: {
    where?: Partial<T>;
    skip?: number;
    take?: number;
    order?: Record<string, 'ASC' | 'DESC'>;
  }): Promise<readonly [T[], number]>;
};

export type TenantRepositoryResolverPort = {
  getCaseRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getLabOrderRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getHl7MessageRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getInvestigationRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getPoliceHoldRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getAuditEventRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getEvidenceItemRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getCustodyEventRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getMediaAssetRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getProtocolVersionRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getCremationCaseRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getIndigentCaseRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getReferenceAgencyRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getReferenceCaseTypeRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getHl7UnmatchedResultRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getCaseReportRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getOfflineSyncSessionRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  getOfflineAuditEventRepository(context: TenantContext): Promise<RepositoryLike<Record<string, unknown>>>;
  assignCanonicalCaseNumber(context: TenantContext, prefix: string, caseYear: number): Promise<string>;
};

export const TENANT_REPOSITORY_RESOLVER = Symbol('TENANT_REPOSITORY_RESOLVER');