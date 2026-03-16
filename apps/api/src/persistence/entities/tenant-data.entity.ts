import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'cases' })
@Unique('uq_cases_tenant_client_uuid', ['tenantId', 'clientCaseUuid'])
@Unique('uq_cases_tenant_canonical', ['tenantId', 'canonicalCaseNumber'])
@Unique('uq_cases_tenant_temporary', ['tenantId', 'temporaryCaseNumber'])
export class CaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Index()
  @Column('uuid', { name: 'client_case_uuid' })
  clientCaseUuid!: string;

  @Column({ name: 'canonical_case_number', nullable: true })
  canonicalCaseNumber!: string | null;

  @Index()
  @Column({ name: 'temporary_case_number' })
  temporaryCaseNumber!: string;

  @Column({ name: 'case_type' })
  caseType!: string;

  @Column({ name: 'status', default: 'Intake' })
  status!: string;

  @Column({ name: 'police_hold', default: false })
  policeHold!: boolean;

  @Column({ name: 'priority', default: false })
  priority!: boolean;

  @Column({ name: 'demographics', type: 'jsonb', nullable: true })
  demographics!: Record<string, unknown> | null;

  @Column({ name: 'intake_summary', type: 'jsonb', nullable: true })
  intakeSummary!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity({ name: 'offline_sync_sessions' })
export class OfflineSyncSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'sync_state', default: 'LocalOnly' })
  syncState!: 'LocalOnly' | 'Queued' | 'Syncing' | 'Synced' | 'Error';

  @Column({ name: 'last_error_code', nullable: true })
  lastErrorCode!: string | null;

  @Column({ name: 'last_error_message', type: 'text', nullable: true })
  lastErrorMessage!: string | null;

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity({ name: 'offline_audit_events' })
export class OfflineAuditEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @Column({ name: 'event_type' })
  eventType!: string;

  @Column({ name: 'event_payload', type: 'jsonb' })
  eventPayload!: Record<string, unknown>;

  @Column({ name: 'event_at', type: 'timestamptz' })
  eventAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'hl7_messages' })
@Unique('uq_hl7_dedupe', ['tenantId', 'labCode', 'messageControlId', 'payloadHash'])
export class Hl7MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'lab_code' })
  labCode!: string;

  @Column({ name: 'direction' })
  direction!: 'Inbound' | 'Outbound';

  @Column({ name: 'message_type' })
  messageType!: 'ORM_O01' | 'ORU_R01' | 'ACK';

  @Column({ name: 'message_control_id' })
  messageControlId!: string;

  @Column({ name: 'payload_hash' })
  payloadHash!: string;

  @Column({ name: 'raw_message', type: 'text' })
  rawMessage!: string;

  @Column({ name: 'processing_state', default: 'Received' })
  processingState!: 'Received' | 'Validated' | 'Mapped' | 'Failed';

  @Column({ name: 'processing_error', type: 'text', nullable: true })
  processingError!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'lab_orders' })
export class LabOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @ManyToOne(() => CaseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: CaseEntity;

  @Column({ name: 'lab_code' })
  labCode!: string;

  @Column({ name: 'order_number' })
  orderNumber!: string;

  @Column({ name: 'status', default: 'Created' })
  status!: 'Created' | 'Sent' | 'Ack' | 'InProgress' | 'Partial' | 'Final' | 'Verified' | 'Finalized';

  @Column({ name: 'ordered_items', type: 'jsonb' })
  orderedItems!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'lab_results' })
export class LabResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'lab_order_id', nullable: true })
  labOrderId!: string | null;

  @Column({ name: 'lab_code' })
  labCode!: string;

  @Column({ name: 'analyte_code' })
  analyteCode!: string;

  @Column({ name: 'result_value', nullable: true })
  resultValue!: string | null;

  @Column({ name: 'result_unit', nullable: true })
  resultUnit!: string | null;

  @Column({ name: 'flag', nullable: true })
  flag!: string | null;

  @Column({ name: 'source_metadata', type: 'jsonb', nullable: true })
  sourceMetadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'investigations' })
@Unique('uq_investigations_tenant_case', ['tenantId', 'caseId'])
export class InvestigationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'investigator_user_id', nullable: true })
  investigatorUserId!: string | null;

  @Column({ name: 'received_at', type: 'timestamptz', nullable: true })
  receivedAt!: Date | null;

  @Column({ name: 'incident_at', type: 'timestamptz', nullable: true })
  incidentAt!: Date | null;

  @Column({ name: 'death_at', type: 'timestamptz', nullable: true })
  deathAt!: Date | null;

  @Column({ name: 'death_location', type: 'jsonb', nullable: true })
  deathLocation!: Record<string, unknown> | null;

  @Column({ name: 'narrative', type: 'text', nullable: true })
  narrative!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity({ name: 'police_holds' })
@Unique('uq_police_holds_tenant_case', ['tenantId', 'caseId'])
export class PoliceHoldEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'held', default: true })
  held!: boolean;

  @Column({ name: 'requested_by', nullable: true })
  requestedBy!: string | null;

  @Column({ name: 'requested_at', type: 'timestamptz', nullable: true })
  requestedAt!: Date | null;

  @Column({ name: 'released_by', nullable: true })
  releasedBy!: string | null;

  @Column({ name: 'released_at', type: 'timestamptz', nullable: true })
  releasedAt!: Date | null;

  @Column({ name: 'note', type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity({ name: 'audit_events' })
export class AuditEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'actor_subject', nullable: true })
  actorSubject!: string | null;

  @Column({ name: 'actor_roles', type: 'jsonb', nullable: true })
  actorRoles!: string[] | null;

  @Column({ name: 'device_id', nullable: true })
  deviceId!: string | null;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'event_type' })
  eventType!: string;

  @Column({ name: 'target_type' })
  targetType!: string;

  @Column({ name: 'target_id' })
  targetId!: string;

  @Column({ name: 'before_state', type: 'jsonb', nullable: true })
  beforeState!: Record<string, unknown> | null;

  @Column({ name: 'after_state', type: 'jsonb', nullable: true })
  afterState!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'event_at', type: 'timestamptz' })
  eventAt!: Date;
}

@Entity({ name: 'evidence_items' })
@Unique('uq_evidence_items_tenant_case_item', ['tenantId', 'caseId', 'itemCode'])
export class EvidenceItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'item_code' })
  itemCode!: string;

  @Column({ name: 'barcode', nullable: true })
  barcode!: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'storage_location', nullable: true })
  storageLocation!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'custody_events' })
export class CustodyEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'evidence_item_id' })
  evidenceItemId!: string;

  @Column({ name: 'event_type' })
  eventType!: string;

  @Column({ name: 'actor_user_id', nullable: true })
  actorUserId!: string | null;

  @Column({ name: 'from_location', nullable: true })
  fromLocation!: string | null;

  @Column({ name: 'to_location', nullable: true })
  toLocation!: string | null;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason!: string | null;

  @Column({ name: 'event_at', type: 'timestamptz' })
  eventAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'media_assets' })
export class MediaAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'media_type' })
  mediaType!: string;

  @Column({ name: 'object_key' })
  objectKey!: string;

  @Column({ name: 'file_name', nullable: true })
  fileName!: string | null;

  @Column({ name: 'content_type', nullable: true })
  contentType!: string | null;

  @Column({ name: 'sha256', nullable: true })
  sha256!: string | null;

  @Column({ name: 'captured_at', type: 'timestamptz', nullable: true })
  capturedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'protocol_versions' })
@Unique('uq_protocol_versions_tenant_case_version', ['tenantId', 'caseId', 'versionNo'])
export class ProtocolVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'version_no' })
  versionNo!: number;

  @Column({ name: 'status' })
  status!: 'Draft' | 'Review' | 'Final';

  @Column({ name: 'protocol_body', type: 'text', nullable: true })
  protocolBody!: string | null;

  @Column({ name: 'authored_by', nullable: true })
  authoredBy!: string | null;

  @Column({ name: 'authored_at', type: 'timestamptz', nullable: true })
  authoredAt!: Date | null;

  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true })
  finalizedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'cremation_cases' })
@Unique('uq_cremation_cases_tenant_case', ['tenantId', 'caseId'])
export class CremationCaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'funeral_home_name', nullable: true })
  funeralHomeName!: string | null;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'indigent', default: false })
  indigent!: boolean;

  @Column({ name: 'fee', type: 'numeric', nullable: true })
  fee!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'indigent_cases' })
@Unique('uq_indigent_cases_tenant_case', ['tenantId', 'caseId'])
export class IndigentCaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'referral_notes', type: 'text', nullable: true })
  referralNotes!: string | null;

  @Column({ name: 'disposition_notes', type: 'text', nullable: true })
  dispositionNotes!: string | null;

  @Column({ name: 'funding', type: 'jsonb', nullable: true })
  funding!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity({ name: 'reference_agencies' })
@Unique('uq_reference_agencies_tenant_name', ['tenantId', 'agencyName'])
export class ReferenceAgencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'agency_name' })
  agencyName!: string;

  @Column({ name: 'agency_type', nullable: true })
  agencyType!: string | null;

  @Column({ name: 'phone', nullable: true })
  phone!: string | null;

  @Column({ name: 'fax', nullable: true })
  fax!: string | null;

  @Column({ name: 'address', type: 'jsonb', nullable: true })
  address!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'reference_case_types' })
@Unique('uq_reference_case_types_tenant_code', ['tenantId', 'caseTypeCode'])
export class ReferenceCaseTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'case_type_code' })
  caseTypeCode!: string;

  @Column({ name: 'description', nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'hl7_unmatched_results' })
@Unique('uq_hl7_unmatched_dedupe', ['tenantId', 'labCode', 'messageControlId', 'payloadHash'])
export class Hl7UnmatchedResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ name: 'lab_code' })
  labCode!: string;

  @Column('uuid', { name: 'hl7_message_id' })
  hl7MessageId!: string;

  @Column({ name: 'message_control_id' })
  messageControlId!: string;

  @Column({ name: 'payload_hash' })
  payloadHash!: string;

  @Column({ name: 'status', default: 'Open' })
  status!: 'Open' | 'Matched' | 'Rejected';

  @Column('uuid', { name: 'matched_case_id', nullable: true })
  matchedCaseId!: string | null;

  @Column({ name: 'matched_by', nullable: true })
  matchedBy!: string | null;

  @Column({ name: 'matched_at', type: 'timestamptz', nullable: true })
  matchedAt!: Date | null;

  @Column({ name: 'rejected_reason', type: 'text', nullable: true })
  rejectedReason!: string | null;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy!: string | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'case_reports' })
@Unique('uq_case_reports_tenant_case_version', ['tenantId', 'caseId', 'versionNo'])
export class CaseReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column('uuid', { name: 'case_id' })
  caseId!: string;

  @Column({ name: 'version_no' })
  versionNo!: number;

  @Column({ name: 'status', default: 'Generated' })
  status!: 'Generated' | 'Signed' | 'Exported';

  @Column({ name: 'report_body', type: 'text', nullable: true })
  reportBody!: string | null;

  @Column({ name: 'signed_by', nullable: true })
  signedBy!: string | null;

  @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
  signedAt!: Date | null;

  @Column({ name: 'exported_at', type: 'timestamptz', nullable: true })
  exportedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}