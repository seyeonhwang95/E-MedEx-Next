var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';
let CaseEntity = class CaseEntity {
    id;
    tenantId;
    clientCaseUuid;
    canonicalCaseNumber;
    temporaryCaseNumber;
    caseType;
    status;
    policeHold;
    priority;
    demographics;
    intakeSummary;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CaseEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "tenantId", void 0);
__decorate([
    Index(),
    Column('uuid', { name: 'client_case_uuid' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "clientCaseUuid", void 0);
__decorate([
    Column({ name: 'canonical_case_number', nullable: true }),
    __metadata("design:type", Object)
], CaseEntity.prototype, "canonicalCaseNumber", void 0);
__decorate([
    Index(),
    Column({ name: 'temporary_case_number' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "temporaryCaseNumber", void 0);
__decorate([
    Column({ name: 'case_type' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "caseType", void 0);
__decorate([
    Column({ name: 'status', default: 'Intake' }),
    __metadata("design:type", String)
], CaseEntity.prototype, "status", void 0);
__decorate([
    Column({ name: 'police_hold', default: false }),
    __metadata("design:type", Boolean)
], CaseEntity.prototype, "policeHold", void 0);
__decorate([
    Column({ name: 'priority', default: false }),
    __metadata("design:type", Boolean)
], CaseEntity.prototype, "priority", void 0);
__decorate([
    Column({ name: 'demographics', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CaseEntity.prototype, "demographics", void 0);
__decorate([
    Column({ name: 'intake_summary', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CaseEntity.prototype, "intakeSummary", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CaseEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CaseEntity.prototype, "updatedAt", void 0);
CaseEntity = __decorate([
    Entity({ name: 'cases' }),
    Unique('uq_cases_tenant_client_uuid', ['tenantId', 'clientCaseUuid']),
    Unique('uq_cases_tenant_canonical', ['tenantId', 'canonicalCaseNumber']),
    Unique('uq_cases_tenant_temporary', ['tenantId', 'temporaryCaseNumber'])
], CaseEntity);
export { CaseEntity };
let OfflineSyncSessionEntity = class OfflineSyncSessionEntity {
    id;
    tenantId;
    userId;
    deviceId;
    caseId;
    syncState;
    lastErrorCode;
    lastErrorMessage;
    lastSyncedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], OfflineSyncSessionEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], OfflineSyncSessionEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'user_id' }),
    __metadata("design:type", String)
], OfflineSyncSessionEntity.prototype, "userId", void 0);
__decorate([
    Column({ name: 'device_id' }),
    __metadata("design:type", String)
], OfflineSyncSessionEntity.prototype, "deviceId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], OfflineSyncSessionEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'sync_state', default: 'LocalOnly' }),
    __metadata("design:type", String)
], OfflineSyncSessionEntity.prototype, "syncState", void 0);
__decorate([
    Column({ name: 'last_error_code', nullable: true }),
    __metadata("design:type", Object)
], OfflineSyncSessionEntity.prototype, "lastErrorCode", void 0);
__decorate([
    Column({ name: 'last_error_message', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], OfflineSyncSessionEntity.prototype, "lastErrorMessage", void 0);
__decorate([
    Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OfflineSyncSessionEntity.prototype, "lastSyncedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OfflineSyncSessionEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OfflineSyncSessionEntity.prototype, "updatedAt", void 0);
OfflineSyncSessionEntity = __decorate([
    Entity({ name: 'offline_sync_sessions' })
], OfflineSyncSessionEntity);
export { OfflineSyncSessionEntity };
let OfflineAuditEventEntity = class OfflineAuditEventEntity {
    id;
    tenantId;
    userId;
    deviceId;
    eventType;
    eventPayload;
    eventAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], OfflineAuditEventEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], OfflineAuditEventEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'user_id' }),
    __metadata("design:type", String)
], OfflineAuditEventEntity.prototype, "userId", void 0);
__decorate([
    Column({ name: 'device_id' }),
    __metadata("design:type", String)
], OfflineAuditEventEntity.prototype, "deviceId", void 0);
__decorate([
    Column({ name: 'event_type' }),
    __metadata("design:type", String)
], OfflineAuditEventEntity.prototype, "eventType", void 0);
__decorate([
    Column({ name: 'event_payload', type: 'jsonb' }),
    __metadata("design:type", Object)
], OfflineAuditEventEntity.prototype, "eventPayload", void 0);
__decorate([
    Column({ name: 'event_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OfflineAuditEventEntity.prototype, "eventAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OfflineAuditEventEntity.prototype, "createdAt", void 0);
OfflineAuditEventEntity = __decorate([
    Entity({ name: 'offline_audit_events' })
], OfflineAuditEventEntity);
export { OfflineAuditEventEntity };
let Hl7MessageEntity = class Hl7MessageEntity {
    id;
    tenantId;
    labCode;
    direction;
    messageType;
    messageControlId;
    payloadHash;
    rawMessage;
    processingState;
    processingError;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'lab_code' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "labCode", void 0);
__decorate([
    Column({ name: 'direction' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "direction", void 0);
__decorate([
    Column({ name: 'message_type' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "messageType", void 0);
__decorate([
    Column({ name: 'message_control_id' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "messageControlId", void 0);
__decorate([
    Column({ name: 'payload_hash' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "payloadHash", void 0);
__decorate([
    Column({ name: 'raw_message', type: 'text' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "rawMessage", void 0);
__decorate([
    Column({ name: 'processing_state', default: 'Received' }),
    __metadata("design:type", String)
], Hl7MessageEntity.prototype, "processingState", void 0);
__decorate([
    Column({ name: 'processing_error', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Hl7MessageEntity.prototype, "processingError", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Hl7MessageEntity.prototype, "createdAt", void 0);
Hl7MessageEntity = __decorate([
    Entity({ name: 'hl7_messages' }),
    Unique('uq_hl7_dedupe', ['tenantId', 'labCode', 'messageControlId', 'payloadHash'])
], Hl7MessageEntity);
export { Hl7MessageEntity };
let LabOrderEntity = class LabOrderEntity {
    id;
    tenantId;
    caseId;
    case;
    labCode;
    orderNumber;
    status;
    orderedItems;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], LabOrderEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], LabOrderEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], LabOrderEntity.prototype, "caseId", void 0);
__decorate([
    ManyToOne(() => CaseEntity, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'case_id' }),
    __metadata("design:type", CaseEntity)
], LabOrderEntity.prototype, "case", void 0);
__decorate([
    Column({ name: 'lab_code' }),
    __metadata("design:type", String)
], LabOrderEntity.prototype, "labCode", void 0);
__decorate([
    Column({ name: 'order_number' }),
    __metadata("design:type", String)
], LabOrderEntity.prototype, "orderNumber", void 0);
__decorate([
    Column({ name: 'status', default: 'Created' }),
    __metadata("design:type", String)
], LabOrderEntity.prototype, "status", void 0);
__decorate([
    Column({ name: 'ordered_items', type: 'jsonb' }),
    __metadata("design:type", Object)
], LabOrderEntity.prototype, "orderedItems", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LabOrderEntity.prototype, "createdAt", void 0);
LabOrderEntity = __decorate([
    Entity({ name: 'lab_orders' })
], LabOrderEntity);
export { LabOrderEntity };
let LabResultEntity = class LabResultEntity {
    id;
    tenantId;
    caseId;
    labOrderId;
    labCode;
    analyteCode;
    resultValue;
    resultUnit;
    flag;
    sourceMetadata;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], LabResultEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], LabResultEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], LabResultEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'lab_order_id', nullable: true }),
    __metadata("design:type", Object)
], LabResultEntity.prototype, "labOrderId", void 0);
__decorate([
    Column({ name: 'lab_code' }),
    __metadata("design:type", String)
], LabResultEntity.prototype, "labCode", void 0);
__decorate([
    Column({ name: 'analyte_code' }),
    __metadata("design:type", String)
], LabResultEntity.prototype, "analyteCode", void 0);
__decorate([
    Column({ name: 'result_value', nullable: true }),
    __metadata("design:type", Object)
], LabResultEntity.prototype, "resultValue", void 0);
__decorate([
    Column({ name: 'result_unit', nullable: true }),
    __metadata("design:type", Object)
], LabResultEntity.prototype, "resultUnit", void 0);
__decorate([
    Column({ name: 'flag', nullable: true }),
    __metadata("design:type", Object)
], LabResultEntity.prototype, "flag", void 0);
__decorate([
    Column({ name: 'source_metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], LabResultEntity.prototype, "sourceMetadata", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LabResultEntity.prototype, "createdAt", void 0);
LabResultEntity = __decorate([
    Entity({ name: 'lab_results' })
], LabResultEntity);
export { LabResultEntity };
let InvestigationEntity = class InvestigationEntity {
    id;
    tenantId;
    caseId;
    investigatorUserId;
    receivedAt;
    incidentAt;
    deathAt;
    deathLocation;
    narrative;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], InvestigationEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], InvestigationEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], InvestigationEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'investigator_user_id', nullable: true }),
    __metadata("design:type", Object)
], InvestigationEntity.prototype, "investigatorUserId", void 0);
__decorate([
    Column({ name: 'received_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], InvestigationEntity.prototype, "receivedAt", void 0);
__decorate([
    Column({ name: 'incident_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], InvestigationEntity.prototype, "incidentAt", void 0);
__decorate([
    Column({ name: 'death_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], InvestigationEntity.prototype, "deathAt", void 0);
__decorate([
    Column({ name: 'death_location', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], InvestigationEntity.prototype, "deathLocation", void 0);
__decorate([
    Column({ name: 'narrative', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], InvestigationEntity.prototype, "narrative", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], InvestigationEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], InvestigationEntity.prototype, "updatedAt", void 0);
InvestigationEntity = __decorate([
    Entity({ name: 'investigations' }),
    Unique('uq_investigations_tenant_case', ['tenantId', 'caseId'])
], InvestigationEntity);
export { InvestigationEntity };
let PoliceHoldEntity = class PoliceHoldEntity {
    id;
    tenantId;
    caseId;
    held;
    requestedBy;
    requestedAt;
    releasedBy;
    releasedAt;
    note;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], PoliceHoldEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], PoliceHoldEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], PoliceHoldEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'held', default: true }),
    __metadata("design:type", Boolean)
], PoliceHoldEntity.prototype, "held", void 0);
__decorate([
    Column({ name: 'requested_by', nullable: true }),
    __metadata("design:type", Object)
], PoliceHoldEntity.prototype, "requestedBy", void 0);
__decorate([
    Column({ name: 'requested_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PoliceHoldEntity.prototype, "requestedAt", void 0);
__decorate([
    Column({ name: 'released_by', nullable: true }),
    __metadata("design:type", Object)
], PoliceHoldEntity.prototype, "releasedBy", void 0);
__decorate([
    Column({ name: 'released_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PoliceHoldEntity.prototype, "releasedAt", void 0);
__decorate([
    Column({ name: 'note', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PoliceHoldEntity.prototype, "note", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PoliceHoldEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PoliceHoldEntity.prototype, "updatedAt", void 0);
PoliceHoldEntity = __decorate([
    Entity({ name: 'police_holds' }),
    Unique('uq_police_holds_tenant_case', ['tenantId', 'caseId'])
], PoliceHoldEntity);
export { PoliceHoldEntity };
let AuditEventEntity = class AuditEventEntity {
    id;
    tenantId;
    actorSubject;
    actorRoles;
    deviceId;
    ipAddress;
    eventType;
    targetType;
    targetId;
    beforeState;
    afterState;
    eventAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AuditEventEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], AuditEventEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'actor_subject', nullable: true }),
    __metadata("design:type", Object)
], AuditEventEntity.prototype, "actorSubject", void 0);
__decorate([
    Column({ name: 'actor_roles', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditEventEntity.prototype, "actorRoles", void 0);
__decorate([
    Column({ name: 'device_id', nullable: true }),
    __metadata("design:type", Object)
], AuditEventEntity.prototype, "deviceId", void 0);
__decorate([
    Column({ name: 'ip_address', nullable: true }),
    __metadata("design:type", Object)
], AuditEventEntity.prototype, "ipAddress", void 0);
__decorate([
    Column({ name: 'event_type' }),
    __metadata("design:type", String)
], AuditEventEntity.prototype, "eventType", void 0);
__decorate([
    Column({ name: 'target_type' }),
    __metadata("design:type", String)
], AuditEventEntity.prototype, "targetType", void 0);
__decorate([
    Column({ name: 'target_id' }),
    __metadata("design:type", String)
], AuditEventEntity.prototype, "targetId", void 0);
__decorate([
    Column({ name: 'before_state', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditEventEntity.prototype, "beforeState", void 0);
__decorate([
    Column({ name: 'after_state', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditEventEntity.prototype, "afterState", void 0);
__decorate([
    CreateDateColumn({ name: 'event_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditEventEntity.prototype, "eventAt", void 0);
AuditEventEntity = __decorate([
    Entity({ name: 'audit_events' })
], AuditEventEntity);
export { AuditEventEntity };
let EvidenceItemEntity = class EvidenceItemEntity {
    id;
    tenantId;
    caseId;
    itemCode;
    barcode;
    description;
    storageLocation;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], EvidenceItemEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], EvidenceItemEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], EvidenceItemEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'item_code' }),
    __metadata("design:type", String)
], EvidenceItemEntity.prototype, "itemCode", void 0);
__decorate([
    Column({ name: 'barcode', nullable: true }),
    __metadata("design:type", Object)
], EvidenceItemEntity.prototype, "barcode", void 0);
__decorate([
    Column({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], EvidenceItemEntity.prototype, "description", void 0);
__decorate([
    Column({ name: 'storage_location', nullable: true }),
    __metadata("design:type", Object)
], EvidenceItemEntity.prototype, "storageLocation", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EvidenceItemEntity.prototype, "createdAt", void 0);
EvidenceItemEntity = __decorate([
    Entity({ name: 'evidence_items' }),
    Unique('uq_evidence_items_tenant_case_item', ['tenantId', 'caseId', 'itemCode'])
], EvidenceItemEntity);
export { EvidenceItemEntity };
let CustodyEventEntity = class CustodyEventEntity {
    id;
    tenantId;
    evidenceItemId;
    eventType;
    actorUserId;
    fromLocation;
    toLocation;
    reason;
    eventAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CustodyEventEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], CustodyEventEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'evidence_item_id' }),
    __metadata("design:type", String)
], CustodyEventEntity.prototype, "evidenceItemId", void 0);
__decorate([
    Column({ name: 'event_type' }),
    __metadata("design:type", String)
], CustodyEventEntity.prototype, "eventType", void 0);
__decorate([
    Column({ name: 'actor_user_id', nullable: true }),
    __metadata("design:type", Object)
], CustodyEventEntity.prototype, "actorUserId", void 0);
__decorate([
    Column({ name: 'from_location', nullable: true }),
    __metadata("design:type", Object)
], CustodyEventEntity.prototype, "fromLocation", void 0);
__decorate([
    Column({ name: 'to_location', nullable: true }),
    __metadata("design:type", Object)
], CustodyEventEntity.prototype, "toLocation", void 0);
__decorate([
    Column({ name: 'reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CustodyEventEntity.prototype, "reason", void 0);
__decorate([
    Column({ name: 'event_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustodyEventEntity.prototype, "eventAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustodyEventEntity.prototype, "createdAt", void 0);
CustodyEventEntity = __decorate([
    Entity({ name: 'custody_events' })
], CustodyEventEntity);
export { CustodyEventEntity };
let MediaAssetEntity = class MediaAssetEntity {
    id;
    tenantId;
    caseId;
    mediaType;
    objectKey;
    fileName;
    contentType;
    sha256;
    capturedAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], MediaAssetEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], MediaAssetEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], MediaAssetEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'media_type' }),
    __metadata("design:type", String)
], MediaAssetEntity.prototype, "mediaType", void 0);
__decorate([
    Column({ name: 'object_key' }),
    __metadata("design:type", String)
], MediaAssetEntity.prototype, "objectKey", void 0);
__decorate([
    Column({ name: 'file_name', nullable: true }),
    __metadata("design:type", Object)
], MediaAssetEntity.prototype, "fileName", void 0);
__decorate([
    Column({ name: 'content_type', nullable: true }),
    __metadata("design:type", Object)
], MediaAssetEntity.prototype, "contentType", void 0);
__decorate([
    Column({ name: 'sha256', nullable: true }),
    __metadata("design:type", Object)
], MediaAssetEntity.prototype, "sha256", void 0);
__decorate([
    Column({ name: 'captured_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], MediaAssetEntity.prototype, "capturedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], MediaAssetEntity.prototype, "createdAt", void 0);
MediaAssetEntity = __decorate([
    Entity({ name: 'media_assets' })
], MediaAssetEntity);
export { MediaAssetEntity };
let ProtocolVersionEntity = class ProtocolVersionEntity {
    id;
    tenantId;
    caseId;
    versionNo;
    status;
    protocolBody;
    authoredBy;
    authoredAt;
    finalizedAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ProtocolVersionEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ProtocolVersionEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], ProtocolVersionEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'version_no' }),
    __metadata("design:type", Number)
], ProtocolVersionEntity.prototype, "versionNo", void 0);
__decorate([
    Column({ name: 'status' }),
    __metadata("design:type", String)
], ProtocolVersionEntity.prototype, "status", void 0);
__decorate([
    Column({ name: 'protocol_body', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ProtocolVersionEntity.prototype, "protocolBody", void 0);
__decorate([
    Column({ name: 'authored_by', nullable: true }),
    __metadata("design:type", Object)
], ProtocolVersionEntity.prototype, "authoredBy", void 0);
__decorate([
    Column({ name: 'authored_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ProtocolVersionEntity.prototype, "authoredAt", void 0);
__decorate([
    Column({ name: 'finalized_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ProtocolVersionEntity.prototype, "finalizedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ProtocolVersionEntity.prototype, "createdAt", void 0);
ProtocolVersionEntity = __decorate([
    Entity({ name: 'protocol_versions' }),
    Unique('uq_protocol_versions_tenant_case_version', ['tenantId', 'caseId', 'versionNo'])
], ProtocolVersionEntity);
export { ProtocolVersionEntity };
let CremationCaseEntity = class CremationCaseEntity {
    id;
    tenantId;
    caseId;
    funeralHomeName;
    approvedBy;
    approvedAt;
    indigent;
    fee;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CremationCaseEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], CremationCaseEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], CremationCaseEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'funeral_home_name', nullable: true }),
    __metadata("design:type", Object)
], CremationCaseEntity.prototype, "funeralHomeName", void 0);
__decorate([
    Column({ name: 'approved_by', nullable: true }),
    __metadata("design:type", Object)
], CremationCaseEntity.prototype, "approvedBy", void 0);
__decorate([
    Column({ name: 'approved_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CremationCaseEntity.prototype, "approvedAt", void 0);
__decorate([
    Column({ name: 'indigent', default: false }),
    __metadata("design:type", Boolean)
], CremationCaseEntity.prototype, "indigent", void 0);
__decorate([
    Column({ name: 'fee', type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], CremationCaseEntity.prototype, "fee", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CremationCaseEntity.prototype, "createdAt", void 0);
CremationCaseEntity = __decorate([
    Entity({ name: 'cremation_cases' }),
    Unique('uq_cremation_cases_tenant_case', ['tenantId', 'caseId'])
], CremationCaseEntity);
export { CremationCaseEntity };
let IndigentCaseEntity = class IndigentCaseEntity {
    id;
    tenantId;
    caseId;
    referralNotes;
    dispositionNotes;
    funding;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], IndigentCaseEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], IndigentCaseEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], IndigentCaseEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'referral_notes', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], IndigentCaseEntity.prototype, "referralNotes", void 0);
__decorate([
    Column({ name: 'disposition_notes', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], IndigentCaseEntity.prototype, "dispositionNotes", void 0);
__decorate([
    Column({ name: 'funding', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IndigentCaseEntity.prototype, "funding", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], IndigentCaseEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], IndigentCaseEntity.prototype, "updatedAt", void 0);
IndigentCaseEntity = __decorate([
    Entity({ name: 'indigent_cases' }),
    Unique('uq_indigent_cases_tenant_case', ['tenantId', 'caseId'])
], IndigentCaseEntity);
export { IndigentCaseEntity };
let ReferenceAgencyEntity = class ReferenceAgencyEntity {
    id;
    tenantId;
    agencyName;
    agencyType;
    phone;
    fax;
    address;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ReferenceAgencyEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ReferenceAgencyEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'agency_name' }),
    __metadata("design:type", String)
], ReferenceAgencyEntity.prototype, "agencyName", void 0);
__decorate([
    Column({ name: 'agency_type', nullable: true }),
    __metadata("design:type", Object)
], ReferenceAgencyEntity.prototype, "agencyType", void 0);
__decorate([
    Column({ name: 'phone', nullable: true }),
    __metadata("design:type", Object)
], ReferenceAgencyEntity.prototype, "phone", void 0);
__decorate([
    Column({ name: 'fax', nullable: true }),
    __metadata("design:type", Object)
], ReferenceAgencyEntity.prototype, "fax", void 0);
__decorate([
    Column({ name: 'address', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ReferenceAgencyEntity.prototype, "address", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ReferenceAgencyEntity.prototype, "createdAt", void 0);
ReferenceAgencyEntity = __decorate([
    Entity({ name: 'reference_agencies' }),
    Unique('uq_reference_agencies_tenant_name', ['tenantId', 'agencyName'])
], ReferenceAgencyEntity);
export { ReferenceAgencyEntity };
let ReferenceCaseTypeEntity = class ReferenceCaseTypeEntity {
    id;
    tenantId;
    caseTypeCode;
    description;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ReferenceCaseTypeEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], ReferenceCaseTypeEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'case_type_code' }),
    __metadata("design:type", String)
], ReferenceCaseTypeEntity.prototype, "caseTypeCode", void 0);
__decorate([
    Column({ name: 'description', nullable: true }),
    __metadata("design:type", Object)
], ReferenceCaseTypeEntity.prototype, "description", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ReferenceCaseTypeEntity.prototype, "createdAt", void 0);
ReferenceCaseTypeEntity = __decorate([
    Entity({ name: 'reference_case_types' }),
    Unique('uq_reference_case_types_tenant_code', ['tenantId', 'caseTypeCode'])
], ReferenceCaseTypeEntity);
export { ReferenceCaseTypeEntity };
let Hl7UnmatchedResultEntity = class Hl7UnmatchedResultEntity {
    id;
    tenantId;
    labCode;
    hl7MessageId;
    messageControlId;
    payloadHash;
    status;
    matchedCaseId;
    matchedBy;
    matchedAt;
    rejectedReason;
    rejectedBy;
    rejectedAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Hl7UnmatchedResultEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Hl7UnmatchedResultEntity.prototype, "tenantId", void 0);
__decorate([
    Column({ name: 'lab_code' }),
    __metadata("design:type", String)
], Hl7UnmatchedResultEntity.prototype, "labCode", void 0);
__decorate([
    Column('uuid', { name: 'hl7_message_id' }),
    __metadata("design:type", String)
], Hl7UnmatchedResultEntity.prototype, "hl7MessageId", void 0);
__decorate([
    Column({ name: 'message_control_id' }),
    __metadata("design:type", String)
], Hl7UnmatchedResultEntity.prototype, "messageControlId", void 0);
__decorate([
    Column({ name: 'payload_hash' }),
    __metadata("design:type", String)
], Hl7UnmatchedResultEntity.prototype, "payloadHash", void 0);
__decorate([
    Column({ name: 'status', default: 'Open' }),
    __metadata("design:type", String)
], Hl7UnmatchedResultEntity.prototype, "status", void 0);
__decorate([
    Column('uuid', { name: 'matched_case_id', nullable: true }),
    __metadata("design:type", Object)
], Hl7UnmatchedResultEntity.prototype, "matchedCaseId", void 0);
__decorate([
    Column({ name: 'matched_by', nullable: true }),
    __metadata("design:type", Object)
], Hl7UnmatchedResultEntity.prototype, "matchedBy", void 0);
__decorate([
    Column({ name: 'matched_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Hl7UnmatchedResultEntity.prototype, "matchedAt", void 0);
__decorate([
    Column({ name: 'rejected_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Hl7UnmatchedResultEntity.prototype, "rejectedReason", void 0);
__decorate([
    Column({ name: 'rejected_by', nullable: true }),
    __metadata("design:type", Object)
], Hl7UnmatchedResultEntity.prototype, "rejectedBy", void 0);
__decorate([
    Column({ name: 'rejected_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Hl7UnmatchedResultEntity.prototype, "rejectedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Hl7UnmatchedResultEntity.prototype, "createdAt", void 0);
Hl7UnmatchedResultEntity = __decorate([
    Entity({ name: 'hl7_unmatched_results' }),
    Unique('uq_hl7_unmatched_dedupe', ['tenantId', 'labCode', 'messageControlId', 'payloadHash'])
], Hl7UnmatchedResultEntity);
export { Hl7UnmatchedResultEntity };
let CaseReportEntity = class CaseReportEntity {
    id;
    tenantId;
    caseId;
    versionNo;
    status;
    reportBody;
    signedBy;
    signedAt;
    exportedAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CaseReportEntity.prototype, "id", void 0);
__decorate([
    Column({ name: 'tenant_id' }),
    __metadata("design:type", String)
], CaseReportEntity.prototype, "tenantId", void 0);
__decorate([
    Column('uuid', { name: 'case_id' }),
    __metadata("design:type", String)
], CaseReportEntity.prototype, "caseId", void 0);
__decorate([
    Column({ name: 'version_no' }),
    __metadata("design:type", Number)
], CaseReportEntity.prototype, "versionNo", void 0);
__decorate([
    Column({ name: 'status', default: 'Generated' }),
    __metadata("design:type", String)
], CaseReportEntity.prototype, "status", void 0);
__decorate([
    Column({ name: 'report_body', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CaseReportEntity.prototype, "reportBody", void 0);
__decorate([
    Column({ name: 'signed_by', nullable: true }),
    __metadata("design:type", Object)
], CaseReportEntity.prototype, "signedBy", void 0);
__decorate([
    Column({ name: 'signed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CaseReportEntity.prototype, "signedAt", void 0);
__decorate([
    Column({ name: 'exported_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CaseReportEntity.prototype, "exportedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CaseReportEntity.prototype, "createdAt", void 0);
CaseReportEntity = __decorate([
    Entity({ name: 'case_reports' }),
    Unique('uq_case_reports_tenant_case_version', ['tenantId', 'caseId', 'versionNo'])
], CaseReportEntity);
export { CaseReportEntity };
