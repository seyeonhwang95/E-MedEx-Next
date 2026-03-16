import 'reflect-metadata';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { apiErrorCodes } from '../src/common/api-error-codes.js';
import { CasesController } from '../src/cases/cases.controller.js';
import { CasesService } from '../src/cases/cases.service.js';
import { CremationController } from '../src/cremation/cremation.controller.js';
import { CremationService } from '../src/cremation/cremation.service.js';
import { EvidenceController } from '../src/evidence/evidence.controller.js';
import { EvidenceService } from '../src/evidence/evidence.service.js';
import { IndigentController } from '../src/indigent/indigent.controller.js';
import { IndigentService } from '../src/indigent/indigent.service.js';
import { InvestigationsController } from '../src/investigations/investigations.controller.js';
import { InvestigationsService } from '../src/investigations/investigations.service.js';
import { LabsController } from '../src/labs/labs.controller.js';
import { LabsService } from '../src/labs/labs.service.js';
import { MediaController } from '../src/media/media.controller.js';
import { MediaService } from '../src/media/media.service.js';
import { OfflineController } from '../src/offline/offline.controller.js';
import { OfflineService } from '../src/offline/offline.service.js';
import { ProtocolsController } from '../src/protocols/protocols.controller.js';
import { ProtocolsService } from '../src/protocols/protocols.service.js';
import { ReferenceController } from '../src/reference/reference.controller.js';
import { ReferenceService } from '../src/reference/reference.service.js';
import { ReportsController } from '../src/reports/reports.controller.js';
import { ReportsService } from '../src/reports/reports.service.js';
import { TenantLabEntity } from '../src/persistence/entities/control-plane.entity.js';
import type { TenantContext } from '../src/tenancy/tenant-context.js';
import { TENANT_REPOSITORY_RESOLVER } from '../src/tenancy/tenant-repository.port.js';

type InMemoryRow = {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  [key: string]: unknown;
};

class InMemoryRepository {
  constructor(private readonly storage: InMemoryRow[]) {}

  create(input: Record<string, unknown>) {
    return {
      ...input,
    };
  }

  async save(input: Record<string, unknown>) {
    const existingIndex = this.storage.findIndex((item) => item.id === input.id);
    const now = new Date();

    if (existingIndex >= 0) {
      const updated = {
        ...this.storage[existingIndex],
        ...input,
        updatedAt: now,
      } as InMemoryRow;
      this.storage[existingIndex] = updated;
      return updated;
    }

    const created = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input,
    } as InMemoryRow;

    this.storage.push(created);
    return created;
  }

  async find(options?: {
    where?: Record<string, unknown>;
    order?: Record<string, 'ASC' | 'DESC'>;
    take?: number;
  }) {
    let items = this.storage.filter((row) => this.matchesWhere(row, options?.where));

    const orderEntry = options?.order ? Object.entries(options.order)[0] : undefined;
    if (orderEntry) {
      const [orderKey, direction] = orderEntry;
      items = items.sort((left, right) => {
        const leftRaw = left[orderKey];
        const rightRaw = right[orderKey];
        const leftValue =
          leftRaw instanceof Date ? leftRaw.getTime() : typeof leftRaw === 'number' ? leftRaw : String(leftRaw);
        const rightValue =
          rightRaw instanceof Date ? rightRaw.getTime() : typeof rightRaw === 'number' ? rightRaw : String(rightRaw);

        if (leftValue === rightValue) {
          return 0;
        }

        return direction === 'DESC' ? (leftValue < rightValue ? 1 : -1) : leftValue < rightValue ? -1 : 1;
      });
    }

    if (typeof options?.take === 'number') {
      items = items.slice(0, options.take);
    }

    return items;
  }

  async findAndCount(options?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
    order?: Record<string, 'ASC' | 'DESC'>;
  }) {
    let items = await this.find({
      where: options?.where,
      order: options?.order,
    });
    const total = items.length;
    const skip = options?.skip ?? 0;
    const take = options?.take ?? items.length;
    items = items.slice(skip, skip + take);
    return [items, total] as const;
  }

  async findOne(options: { where?: Record<string, unknown> }) {
    return this.storage.find((row) => this.matchesWhere(row, options.where)) ?? null;
  }

  private matchesWhere(row: Record<string, unknown>, where?: Record<string, unknown>) {
    if (!where) {
      return true;
    }

    return Object.entries(where).every(([key, value]) => row[key] === value);
  }
}

type TenantStore = {
  cases: InMemoryRow[];
  custodyEvents: InMemoryRow[];
  evidenceItems: InMemoryRow[];
  labOrders: InMemoryRow[];
  hl7Messages: InMemoryRow[];
  mediaAssets: InMemoryRow[];
  auditEvents: InMemoryRow[];
  protocolVersions: InMemoryRow[];
  cremationCases: InMemoryRow[];
  indigentCases: InMemoryRow[];
  investigations: InMemoryRow[];
  referenceAgencies: InMemoryRow[];
  referenceCaseTypes: InMemoryRow[];
  hl7UnmatchedResults: InMemoryRow[];
  caseReports: InMemoryRow[];
  offlineSyncSessions: InMemoryRow[];
  offlineAuditEvents: InMemoryRow[];
};

class InMemoryTenantDataSourceResolverService {
  private readonly storesByTenantId = new Map<string, TenantStore>();
  private readonly sequenceState = new Map<string, number>();

  async getCaseRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.cases);
  }

  async getLabOrderRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.labOrders);
  }

  async getEvidenceItemRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.evidenceItems);
  }

  async getCustodyEventRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.custodyEvents);
  }

  async getMediaAssetRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.mediaAssets);
  }

  async getAuditEventRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.auditEvents);
  }

  async getInvestigationRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.investigations);
  }

  async getProtocolVersionRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.protocolVersions);
  }

  async getCremationCaseRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.cremationCases);
  }

  async getIndigentCaseRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.indigentCases);
  }

  async getReferenceAgencyRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.referenceAgencies);
  }

  async getReferenceCaseTypeRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.referenceCaseTypes);
  }

  async getHl7MessageRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.hl7Messages);
  }

  async getHl7UnmatchedResultRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.hl7UnmatchedResults);
  }

  async getCaseReportRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.caseReports);
  }

  async getOfflineSyncSessionRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.offlineSyncSessions);
  }

  async getOfflineAuditEventRepository(context: TenantContext) {
    const store = this.ensureStore(context.tenantId);
    return new InMemoryRepository(store.offlineAuditEvents);
  }

  async assignCanonicalCaseNumber(context: TenantContext, prefix: string, caseYear: number) {
    const key = `${context.tenantId}:${prefix}:${caseYear}`;
    const next = (this.sequenceState.get(key) ?? 0) + 1;
    this.sequenceState.set(key, next);
    return `${prefix.toUpperCase()}${caseYear}-${String(next).padStart(6, '0')}`;
  }

  private ensureStore(tenantId: string): TenantStore {
    let store = this.storesByTenantId.get(tenantId);
    if (!store) {
      store = {
        cases: [],
        custodyEvents: [],
        evidenceItems: [],
        labOrders: [],
        hl7Messages: [],
        mediaAssets: [],
        auditEvents: [],
        protocolVersions: [],
        cremationCases: [],
        indigentCases: [],
        investigations: [],
        referenceAgencies: [],
        referenceCaseTypes: [],
        hl7UnmatchedResults: [],
        caseReports: [],
        offlineSyncSessions: [],
        offlineAuditEvents: [],
      };
      this.storesByTenantId.set(tenantId, store);
    }

    return store;
  }
}

describe('API integration', () => {
  let app: INestApplication;
  const controlPlaneLabStore: InMemoryRow[] = [];

  before(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [
        CasesController,
        CremationController,
        EvidenceController,
        IndigentController,
        InvestigationsController,
        LabsController,
        MediaController,
        OfflineController,
        ProtocolsController,
        ReferenceController,
        ReportsController,
      ],
      providers: [
        CasesService,
        CremationService,
        EvidenceService,
        IndigentService,
        InvestigationsService,
        LabsService,
        MediaService,
        OfflineService,
        ProtocolsService,
        ReferenceService,
        ReportsService,
        {
          provide: TENANT_REPOSITORY_RESOLVER,
          useClass: InMemoryTenantDataSourceResolverService,
        },
        {
          provide: getRepositoryToken(TenantLabEntity),
          useValue: new InMemoryRepository(controlPlaneLabStore),
        },
      ],
    }).compile();

    app = testingModule.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.use((req: Request & { tenant?: TenantContext }, _res: Response, next: NextFunction) => {
      const tenantId = String(req.headers['x-tenant-id'] ?? 'demo');
      req.tenant = {
        tenantId,
        subdomain: tenantId,
        tenantDbName: `emedex_${tenantId}`,
        tenantDbSecretRef: null,
        storagePrefix: `emedex-media/${tenantId}`,
        searchPrefix: `emedex-${tenantId}`,
      };
      next();
    });

    await app.init();
  });

  after(async () => {
    await app.close();
  });

  it('rejects unknown body fields for case create', async () => {
    const response = await request(app.getHttpServer())
      .post('/cases')
      .set('x-tenant-id', 'demo')
      .send({
        clientCaseUuid: randomUUID(),
        temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-001',
        caseType: 'TOX',
        invalidExtra: true,
      });

    assert.equal(response.status, 400);
  });

  it('isolates cases by tenant and supports pagination', async () => {
    await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-002',
      caseType: 'TOX',
    });

    await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'alpha').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-ALPHA-SITE-20260316-DEV01-001',
      caseType: 'NME',
    });

    const demoList = await request(app.getHttpServer())
      .get('/cases?page=1&pageSize=10&caseType=TOX')
      .set('x-tenant-id', 'demo');
    const alphaList = await request(app.getHttpServer())
      .get('/cases?page=1&pageSize=10')
      .set('x-tenant-id', 'alpha');

    assert.equal(demoList.status, 200);
    assert.equal(alphaList.status, 200);
    assert.equal(demoList.body.total, 1);
    assert.equal(alphaList.body.total, 1);
    assert.equal(demoList.body.items[0].tenantId, 'demo');
    assert.equal(alphaList.body.items[0].tenantId, 'alpha');
  });

  it('rejects invalid pagination query parameters', async () => {
    const response = await request(app.getHttpServer()).get('/cases?page=0&pageSize=500').set('x-tenant-id', 'demo');
    assert.equal(response.status, 400);
  });

  it('deduplicates hl7 message ingestion per tenant', async () => {
    const rawMessage =
      'MSH|^~\\&|LAB|TOX|EMEDEX|DEMO|20260316100500||ORU^R01|ORU-10001|P|2.5.1\rPID|1||123456^^^EMEDEX||DOE^JANE';

    const first = await request(app.getHttpServer()).post('/labs/hl7/messages').set('x-tenant-id', 'demo').send({
      labCode: 'LAB-A',
      direction: 'Inbound',
      rawMessage,
    });

    const second = await request(app.getHttpServer()).post('/labs/hl7/messages').set('x-tenant-id', 'demo').send({
      labCode: 'LAB-A',
      direction: 'Inbound',
      rawMessage,
    });

    const demoMessages = await request(app.getHttpServer())
      .get('/labs/hl7/messages?page=1&pageSize=10&labCode=LAB-A')
      .set('x-tenant-id', 'demo');
    const alphaMessages = await request(app.getHttpServer())
      .get('/labs/hl7/messages?page=1&pageSize=10&labCode=LAB-A')
      .set('x-tenant-id', 'alpha');

    assert.equal(first.status, 201);
    assert.equal(second.status, 201);
    assert.equal(first.body.id, second.body.id);
    assert.equal(demoMessages.body.total, 1);
    assert.equal(alphaMessages.body.total, 0);

    const unmatchedDemo = await request(app.getHttpServer())
      .get('/labs/hl7/unmatched-results?page=1&pageSize=10&labCode=LAB-A')
      .set('x-tenant-id', 'demo');
    const unmatchedAlpha = await request(app.getHttpServer())
      .get('/labs/hl7/unmatched-results?page=1&pageSize=10&labCode=LAB-A')
      .set('x-tenant-id', 'alpha');

    assert.equal(unmatchedDemo.status, 200);
    assert.equal(unmatchedAlpha.status, 200);
    assert.equal(unmatchedDemo.body.total, 1);
    assert.equal(unmatchedAlpha.body.total, 0);
    assert.equal(unmatchedDemo.body.items[0].status, 'Open');
  });

  it('auto-selects lab for order creation from tenant lab routing rules', async () => {
    controlPlaneLabStore.push({
      id: randomUUID(),
      createdAt: new Date('2026-03-16T09:00:00.000Z'),
      updatedAt: new Date('2026-03-16T09:00:00.000Z'),
      tenantId: 'demo',
      labCode: 'LAB-Z',
      displayName: 'Fallback Lab',
      mllpHost: 'fallback.local',
      mllpPort: 2575,
      isActive: true,
      configVersion: '1',
      versionNo: 1,
      routingRules: {
        caseTypes: ['NME'],
      },
    });
    controlPlaneLabStore.push({
      id: randomUUID(),
      createdAt: new Date('2026-03-16T09:01:00.000Z'),
      updatedAt: new Date('2026-03-16T09:01:00.000Z'),
      tenantId: 'demo',
      labCode: 'LAB-A',
      displayName: 'Alcohol Routing Lab',
      mllpHost: 'alcohol.local',
      mllpPort: 2576,
      isActive: true,
      configVersion: '1',
      versionNo: 1,
      routingRules: {
        caseTypes: ['TOX'],
        testTypes: ['Alcohol'],
      },
    });

    const caseResponse = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-005',
      caseType: 'TOX',
    });

    const createOrder = await request(app.getHttpServer()).post('/labs/orders').set('x-tenant-id', 'demo').send({
      caseId: caseResponse.body.id,
      orderNumber: 'ORD-10001',
      orderedItems: {
        panel: 'ETOH',
      },
      routingContext: {
        testType: 'Alcohol',
      },
    });

    assert.equal(createOrder.status, 201);
    assert.equal(createOrder.body.labCode, 'LAB-A');
  });

  it('reconciles unmatched results by matching to tenant case and supports rejection', async () => {
    const createCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-004',
      caseType: 'TOX',
    });

    const rawMessageOne =
      'MSH|^~\\&|LAB|TOX|EMEDEX|DEMO|20260316101500||ORU^R01|ORU-20001|P|2.5.1\rPID|1||123456^^^EMEDEX||DOE^JOHN';
    const rawMessageTwo =
      'MSH|^~\\&|LAB|TOX|EMEDEX|DEMO|20260316102500||ORU^R01|ORU-20002|P|2.5.1\rPID|1||987654^^^EMEDEX||ROE^JANE';

    await request(app.getHttpServer()).post('/labs/hl7/messages').set('x-tenant-id', 'demo').send({
      labCode: 'LAB-B',
      direction: 'Inbound',
      rawMessage: rawMessageOne,
    });

    await request(app.getHttpServer()).post('/labs/hl7/messages').set('x-tenant-id', 'demo').send({
      labCode: 'LAB-B',
      direction: 'Inbound',
      rawMessage: rawMessageTwo,
    });

    const listOpen = await request(app.getHttpServer())
      .get('/labs/hl7/unmatched-results?page=1&pageSize=10&labCode=LAB-B&status=Open')
      .set('x-tenant-id', 'demo');

    const unmatchedIdToMatch = listOpen.body.items[0].id;
    const unmatchedIdToReject = listOpen.body.items[1].id;

    const matched = await request(app.getHttpServer())
      .post(`/labs/hl7/unmatched-results/${unmatchedIdToMatch}/match-case`)
      .set('x-tenant-id', 'demo')
      .send({ caseId: createCase.body.id });

    const rejected = await request(app.getHttpServer())
      .post(`/labs/hl7/unmatched-results/${unmatchedIdToReject}/reject`)
      .set('x-tenant-id', 'demo')
      .send({ reason: 'No matching case in tenant queue' });

    const listMatched = await request(app.getHttpServer())
      .get('/labs/hl7/unmatched-results?page=1&pageSize=10&labCode=LAB-B&status=Matched')
      .set('x-tenant-id', 'demo');
    const listRejected = await request(app.getHttpServer())
      .get('/labs/hl7/unmatched-results?page=1&pageSize=10&labCode=LAB-B&status=Rejected')
      .set('x-tenant-id', 'demo');

    assert.equal(listOpen.status, 200);
    assert.equal(listOpen.body.total, 2);
    assert.equal(matched.status, 201);
    assert.equal(rejected.status, 201);
    assert.equal(matched.body.status, 'Matched');
    assert.equal(matched.body.matchedCaseId, createCase.body.id);
    assert.equal(rejected.body.status, 'Rejected');
    assert.equal(rejected.body.rejectedReason, 'No matching case in tenant queue');
    assert.equal(listMatched.body.total, 1);
    assert.equal(listRejected.body.total, 1);
  });

  it('prevents cross-tenant match for unmatched results', async () => {
    const alphaCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'alpha').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-ALPHA-SITE-20260316-DEV01-002',
      caseType: 'TOX',
    });

    const rawMessage =
      'MSH|^~\\&|LAB|TOX|EMEDEX|DEMO|20260316103500||ORU^R01|ORU-20003|P|2.5.1\rPID|1||555555^^^EMEDEX||CROSS^TENANT';

    await request(app.getHttpServer()).post('/labs/hl7/messages').set('x-tenant-id', 'demo').send({
      labCode: 'LAB-C',
      direction: 'Inbound',
      rawMessage,
    });

    const listOpenDemo = await request(app.getHttpServer())
      .get('/labs/hl7/unmatched-results?page=1&pageSize=10&labCode=LAB-C&status=Open')
      .set('x-tenant-id', 'demo');

    const unmatchedId = listOpenDemo.body.items[0].id;
    const crossTenantMatch = await request(app.getHttpServer())
      .post(`/labs/hl7/unmatched-results/${unmatchedId}/match-case`)
      .set('x-tenant-id', 'demo')
      .send({ caseId: alphaCase.body.id });

    assert.equal(listOpenDemo.status, 200);
    assert.equal(listOpenDemo.body.total, 1);
    assert.equal(crossTenantMatch.status, 404);
  });

  it('assigns canonical number without skipping in sequence', async () => {
    const createResponse = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-003',
      caseType: 'BME',
    });

    const caseId = createResponse.body.id;
    const firstAssign = await request(app.getHttpServer())
      .post(`/cases/${caseId}/assign-canonical`)
      .set('x-tenant-id', 'demo')
      .send({ prefix: 'BME', caseYear: 2026 });

    const secondAssign = await request(app.getHttpServer())
      .post(`/cases/${caseId}/assign-canonical`)
      .set('x-tenant-id', 'demo')
      .send({ prefix: 'BME', caseYear: 2026 });

    assert.equal(firstAssign.status, 201);
    assert.equal(secondAssign.status, 201);
    assert.equal(firstAssign.body.canonicalCaseNumber, 'BME2026-000001');
    assert.equal(secondAssign.body.canonicalCaseNumber, 'BME2026-000001');
  });

  it('creates and queries evidence by barcode and tenant', async () => {
    const demoCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-010',
      caseType: 'TOX',
    });

    const alphaCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'alpha').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-ALPHA-SITE-20260316-DEV01-010',
      caseType: 'TOX',
    });

    const createDemoEvidence = await request(app.getHttpServer()).post('/evidence').set('x-tenant-id', 'demo').send({
      caseId: demoCase.body.id,
      itemCode: 'TOX-KIT',
      barcode: 'BC-DEMO-001',
      description: 'Toxicology specimen tube',
      storageLocation: 'Evidence Locker A',
    });

    const createAlphaEvidence = await request(app.getHttpServer()).post('/evidence').set('x-tenant-id', 'alpha').send({
      caseId: alphaCase.body.id,
      itemCode: 'TOX-KIT',
      barcode: 'BC-ALPHA-001',
      description: 'Toxicology specimen tube',
      storageLocation: 'Evidence Locker B',
    });

    const demoByBarcode = await request(app.getHttpServer())
      .get('/evidence/barcode/BC-DEMO-001')
      .set('x-tenant-id', 'demo');
    const alphaByBarcode = await request(app.getHttpServer())
      .get('/evidence/barcode/BC-DEMO-001')
      .set('x-tenant-id', 'alpha');

    assert.equal(createDemoEvidence.status, 201);
    assert.equal(createAlphaEvidence.status, 201);
    assert.equal(demoByBarcode.status, 200);
    assert.equal(alphaByBarcode.status, 404);
    assert.equal(demoByBarcode.body.tenantId, 'demo');
  });

  it('records custody events and lists event history for an evidence item', async () => {
    const caseResponse = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-020',
      caseType: 'NME',
    });

    const evidenceResponse = await request(app.getHttpServer()).post('/evidence').set('x-tenant-id', 'demo').send({
      caseId: caseResponse.body.id,
      itemCode: 'NME-SPECIMEN',
      barcode: 'BC-DEMO-020',
      storageLocation: 'Field Intake',
    });

    const evidenceItemId = evidenceResponse.body.id;
    const firstEvent = await request(app.getHttpServer())
      .post(`/evidence/${evidenceItemId}/custody-events`)
      .set('x-tenant-id', 'demo')
      .send({
        eventType: 'Received',
        fromLocation: 'Scene',
        toLocation: 'Field Intake',
        eventAt: '2026-03-16T10:00:00.000Z',
      });

    const secondEvent = await request(app.getHttpServer())
      .post(`/evidence/${evidenceItemId}/custody-events`)
      .set('x-tenant-id', 'demo')
      .send({
        eventType: 'Transferred',
        fromLocation: 'Field Intake',
        toLocation: 'Lab Receiving',
        reason: 'Lab analysis intake',
        eventAt: '2026-03-16T11:00:00.000Z',
      });

    const eventList = await request(app.getHttpServer())
      .get(`/evidence/${evidenceItemId}/custody-events`)
      .set('x-tenant-id', 'demo');

    assert.equal(firstEvent.status, 201);
    assert.equal(secondEvent.status, 201);
    assert.equal(eventList.status, 200);
    assert.equal(eventList.body.total, 2);
    assert.equal(eventList.body.items[0].eventType, 'Transferred');
    assert.equal(eventList.body.items[1].eventType, 'Received');
  });

  it('creates and lists media assets with tenant isolation', async () => {
    const demoCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-030',
      caseType: 'TOX',
    });

    const alphaCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'alpha').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-ALPHA-SITE-20260316-DEV01-030',
      caseType: 'TOX',
    });

    const demoMedia = await request(app.getHttpServer()).post('/media-assets').set('x-tenant-id', 'demo').send({
      caseId: demoCase.body.id,
      mediaType: 'Photo',
      objectKey: 'emedex-media/demo/2026/03/16/photo-001.jpg',
      fileName: 'scene-001.jpg',
      contentType: 'image/jpeg',
      sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      capturedAt: '2026-03-16T12:00:00.000Z',
    });

    const alphaMedia = await request(app.getHttpServer()).post('/media-assets').set('x-tenant-id', 'alpha').send({
      caseId: alphaCase.body.id,
      mediaType: 'Photo',
      objectKey: 'emedex-media/alpha/2026/03/16/photo-001.jpg',
      fileName: 'scene-002.jpg',
      contentType: 'image/jpeg',
      sha256: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      capturedAt: '2026-03-16T12:15:00.000Z',
    });

    const demoList = await request(app.getHttpServer())
      .get(`/media-assets?page=1&pageSize=10&caseId=${demoCase.body.id}&mediaType=Photo`)
      .set('x-tenant-id', 'demo');
    const alphaList = await request(app.getHttpServer()).get('/media-assets?page=1&pageSize=10').set('x-tenant-id', 'alpha');

    assert.equal(demoMedia.status, 201);
    assert.equal(alphaMedia.status, 201);
    assert.equal(demoList.status, 200);
    assert.equal(alphaList.status, 200);
    assert.equal(demoList.body.total, 1);
    assert.equal(alphaList.body.total, 1);
    assert.equal(demoList.body.items[0].tenantId, 'demo');
    assert.equal(alphaList.body.items[0].tenantId, 'alpha');
  });

  it('returns media by id and writes an audit event', async () => {
    const caseResponse = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-040',
      caseType: 'NME',
    });

    const mediaResponse = await request(app.getHttpServer()).post('/media-assets').set('x-tenant-id', 'demo').send({
      caseId: caseResponse.body.id,
      mediaType: 'Document',
      objectKey: 'emedex-media/demo/2026/03/16/doc-001.pdf',
      fileName: 'chain-of-custody.pdf',
      contentType: 'application/pdf',
      capturedAt: '2026-03-16T13:00:00.000Z',
    });

    const getResponse = await request(app.getHttpServer())
      .get(`/media-assets/${mediaResponse.body.id}`)
      .set('x-tenant-id', 'demo');
    const crossTenantResponse = await request(app.getHttpServer())
      .get(`/media-assets/${mediaResponse.body.id}`)
      .set('x-tenant-id', 'alpha');

    assert.equal(mediaResponse.status, 201);
    assert.equal(getResponse.status, 200);
    assert.equal(crossTenantResponse.status, 404);
    assert.equal(getResponse.body.id, mediaResponse.body.id);

    const downloadResponse = await request(app.getHttpServer())
      .get(`/media-assets/${mediaResponse.body.id}/download`)
      .set('x-tenant-id', 'demo');
    const crossTenantDownload = await request(app.getHttpServer())
      .get(`/media-assets/${mediaResponse.body.id}/download`)
      .set('x-tenant-id', 'alpha');

    assert.equal(downloadResponse.status, 200);
    assert.equal(crossTenantDownload.status, 404);
    assert.equal(downloadResponse.body.mediaAssetId, mediaResponse.body.id);
    assert.equal(downloadResponse.body.mimeType, 'application/pdf');
    assert.equal(typeof downloadResponse.body.downloadUrl, 'string');
  });

  it('supports protocol draft-review-final lifecycle and blocks mutation of final version', async () => {
    const caseResponse = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-050',
      caseType: 'NME',
    });

    const createVersion = await request(app.getHttpServer())
      .post(`/protocols/${caseResponse.body.id}/versions`)
      .set('x-tenant-id', 'demo')
      .send({
        protocolBody: 'Initial draft findings',
        authoredBy: 'Dr. Demo',
      });

    const submitReview = await request(app.getHttpServer())
      .post(`/protocols/${caseResponse.body.id}/versions/1/submit-review`)
      .set('x-tenant-id', 'demo')
      .send();

    const finalize = await request(app.getHttpServer())
      .post(`/protocols/${caseResponse.body.id}/versions/1/finalize`)
      .set('x-tenant-id', 'demo')
      .send();

    const updateFinal = await request(app.getHttpServer())
      .put(`/protocols/${caseResponse.body.id}/versions/1`)
      .set('x-tenant-id', 'demo')
      .send({ protocolBody: 'Attempted change after finalization' });

    const submitReviewAfterFinal = await request(app.getHttpServer())
      .post(`/protocols/${caseResponse.body.id}/versions/1/submit-review`)
      .set('x-tenant-id', 'demo')
      .send();

    const createSecondVersion = await request(app.getHttpServer())
      .post(`/protocols/${caseResponse.body.id}/versions`)
      .set('x-tenant-id', 'demo')
      .send({
        protocolBody: 'Amendment draft v2',
        authoredBy: 'Dr. Demo',
      });

    const listVersions = await request(app.getHttpServer())
      .get(`/protocols/${caseResponse.body.id}/versions`)
      .set('x-tenant-id', 'demo');

    assert.equal(createVersion.status, 201);
    assert.equal(createVersion.body.status, 'Draft');
    assert.equal(createVersion.body.versionNo, 1);
    assert.equal(submitReview.status, 201);
    assert.equal(submitReview.body.status, 'Review');
    assert.equal(finalize.status, 201);
    assert.equal(finalize.body.status, 'Final');
    assert.equal(updateFinal.status, 400);
    assert.equal(updateFinal.body.code, apiErrorCodes.ProtocolFinalImmutableCreateNewVersion);
    assert.equal(submitReviewAfterFinal.status, 400);
    assert.equal(submitReviewAfterFinal.body.code, apiErrorCodes.ProtocolFinalImmutable);
    assert.equal(createSecondVersion.status, 201);
    assert.equal(createSecondVersion.body.versionNo, 2);
    assert.equal(listVersions.status, 200);
    assert.equal(listVersions.body.total, 2);
    assert.equal(listVersions.body.items[0].versionNo, 2);
    assert.equal(listVersions.body.items[1].versionNo, 1);
  });

  it('blocks report export until finalized protocol and allows generate-sign-export workflow', async () => {
    const caseResponse = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-090',
      caseType: 'NME',
    });

    await request(app.getHttpServer()).post(`/protocols/${caseResponse.body.id}/versions`).set('x-tenant-id', 'demo').send({
      protocolBody: 'Draft protocol body',
      authoredBy: 'Dr. Demo',
    });

    const generated = await request(app.getHttpServer())
      .post(`/reports/${caseResponse.body.id}/generate`)
      .set('x-tenant-id', 'demo')
      .send({ templateId: 'default' });

    const exportBeforeSign = await request(app.getHttpServer())
      .post(`/reports/${caseResponse.body.id}/export`)
      .set('x-tenant-id', 'demo')
      .send();

    const signed = await request(app.getHttpServer())
      .post(`/reports/${caseResponse.body.id}/sign`)
      .set('x-tenant-id', 'demo')
      .send();

    const blockedExport = await request(app.getHttpServer())
      .post(`/reports/${caseResponse.body.id}/export`)
      .set('x-tenant-id', 'demo')
      .send();

    await request(app.getHttpServer())
      .post(`/protocols/${caseResponse.body.id}/versions/1/finalize`)
      .set('x-tenant-id', 'demo')
      .send();

    const exported = await request(app.getHttpServer())
      .post(`/reports/${caseResponse.body.id}/export`)
      .set('x-tenant-id', 'demo')
      .send();

    assert.equal(generated.status, 201);
    assert.equal(generated.body.status, 'Generated');
    assert.equal(exportBeforeSign.status, 400);
    assert.equal(exportBeforeSign.body.code, apiErrorCodes.ReportExportReportNotSigned);
    assert.equal(signed.status, 201);
    assert.equal(signed.body.status, 'Signed');
    assert.equal(blockedExport.status, 400);
    assert.equal(blockedExport.body.code, apiErrorCodes.ReportExportProtocolNotFinal);
    assert.equal(exported.status, 201);
    assert.equal(exported.body.report.status, 'Exported');
    assert.equal(exported.body.export.mimeType, 'application/pdf');
  });

  it('isolates protocol versions by tenant', async () => {
    const demoCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-060',
      caseType: 'TOX',
    });

    const alphaCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'alpha').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-ALPHA-SITE-20260316-DEV01-060',
      caseType: 'TOX',
    });

    await request(app.getHttpServer()).post(`/protocols/${demoCase.body.id}/versions`).set('x-tenant-id', 'demo').send({
      protocolBody: 'Demo protocol',
    });

    await request(app.getHttpServer()).post(`/protocols/${alphaCase.body.id}/versions`).set('x-tenant-id', 'alpha').send({
      protocolBody: 'Alpha protocol',
    });

    const demoList = await request(app.getHttpServer())
      .get(`/protocols/${demoCase.body.id}/versions`)
      .set('x-tenant-id', 'demo');

    const crossTenantList = await request(app.getHttpServer())
      .get(`/protocols/${demoCase.body.id}/versions`)
      .set('x-tenant-id', 'alpha');

    assert.equal(demoList.status, 200);
    assert.equal(demoList.body.total, 1);
    assert.equal(crossTenantList.status, 404);
  });

  it('upserts cremation approval workflow fields and enforces tenant isolation', async () => {
    const demoCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-070',
      caseType: 'NME',
    });

    const upsert = await request(app.getHttpServer())
      .put(`/cremation-cases/${demoCase.body.id}`)
      .set('x-tenant-id', 'demo')
      .send({
        funeralHomeName: 'Sunrise Funeral Home',
        approvedBy: 'Chief Pathologist',
        approvedAt: '2026-03-16T14:00:00.000Z',
        indigent: true,
        fee: 450,
      });

    const fetchDemo = await request(app.getHttpServer())
      .get(`/cremation-cases/${demoCase.body.id}`)
      .set('x-tenant-id', 'demo');
    const fetchAlpha = await request(app.getHttpServer())
      .get(`/cremation-cases/${demoCase.body.id}`)
      .set('x-tenant-id', 'alpha');

    assert.equal(upsert.status, 200);
    assert.equal(fetchDemo.status, 200);
    assert.equal(fetchDemo.body.funeralHomeName, 'Sunrise Funeral Home');
    assert.equal(fetchDemo.body.approvedBy, 'Chief Pathologist');
    assert.equal(fetchDemo.body.indigent, true);
    assert.equal(fetchAlpha.status, 404);
  });

  it('upserts indigent referral and auto-fills disposition notes from investigation narrative', async () => {
    const caseResponse = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-080',
      caseType: 'NME',
    });

    await request(app.getHttpServer())
      .put(`/investigations/${caseResponse.body.id}`)
      .set('x-tenant-id', 'demo')
      .send({
        narrative: 'Investigation narrative default for disposition',
      });

    const upsertIndigent = await request(app.getHttpServer())
      .put(`/indigent-cases/${caseResponse.body.id}`)
      .set('x-tenant-id', 'demo')
      .send({
        referralNotes: 'Referred by social services',
        funding: {
          source: 'County Assistance',
          approvedAmount: 900,
        },
      });

    const fetched = await request(app.getHttpServer())
      .get(`/indigent-cases/${caseResponse.body.id}`)
      .set('x-tenant-id', 'demo');

    const crossTenant = await request(app.getHttpServer())
      .get(`/indigent-cases/${caseResponse.body.id}`)
      .set('x-tenant-id', 'alpha');

    assert.equal(upsertIndigent.status, 200);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.referralNotes, 'Referred by social services');
    assert.equal(fetched.body.dispositionNotes, 'Investigation narrative default for disposition');
    assert.equal(crossTenant.status, 404);
  });

  it('creates and lists reference agencies with tenant isolation', async () => {
    const demoAgency = await request(app.getHttpServer()).post('/reference/agencies').set('x-tenant-id', 'demo').send({
      agencyName: 'City Police Department',
      agencyType: 'LEO',
      phone: '555-0100',
      address: {
        line1: '100 Main St',
        city: 'Demo City',
      },
    });

    const alphaAgency = await request(app.getHttpServer()).post('/reference/agencies').set('x-tenant-id', 'alpha').send({
      agencyName: 'County Hospital',
      agencyType: 'Hospital',
      phone: '555-0200',
    });

    const demoList = await request(app.getHttpServer())
      .get('/reference/agencies?page=1&pageSize=10&agencyType=LEO')
      .set('x-tenant-id', 'demo');
    const alphaList = await request(app.getHttpServer())
      .get('/reference/agencies?page=1&pageSize=10')
      .set('x-tenant-id', 'alpha');

    assert.equal(demoAgency.status, 201);
    assert.equal(alphaAgency.status, 201);
    assert.equal(demoList.status, 200);
    assert.equal(alphaList.status, 200);
    assert.equal(demoList.body.total, 1);
    assert.equal(alphaList.body.total, 1);
    assert.equal(demoList.body.items[0].agencyName, 'City Police Department');
    assert.equal(alphaList.body.items[0].agencyName, 'County Hospital');
  });

  it('creates and lists reference case types with tenant isolation', async () => {
    const demoCaseType = await request(app.getHttpServer()).post('/reference/case-types').set('x-tenant-id', 'demo').send({
      caseTypeCode: 'TOX',
      description: 'Toxicology case',
    });

    const alphaCaseType = await request(app.getHttpServer()).post('/reference/case-types').set('x-tenant-id', 'alpha').send({
      caseTypeCode: 'NME',
      description: 'Non-medical examiner',
    });

    const demoList = await request(app.getHttpServer())
      .get('/reference/case-types?page=1&pageSize=10&caseTypeCode=TOX')
      .set('x-tenant-id', 'demo');
    const alphaList = await request(app.getHttpServer())
      .get('/reference/case-types?page=1&pageSize=10')
      .set('x-tenant-id', 'alpha');

    assert.equal(demoCaseType.status, 201);
    assert.equal(alphaCaseType.status, 201);
    assert.equal(demoList.status, 200);
    assert.equal(alphaList.status, 200);
    assert.equal(demoList.body.total, 1);
    assert.equal(alphaList.body.total, 1);
    assert.equal(demoList.body.items[0].caseTypeCode, 'TOX');
    assert.equal(alphaList.body.items[0].caseTypeCode, 'NME');
  });

  it('upserts and lists offline sync sessions with tenant isolation', async () => {
    const demoCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'demo').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-DEMO-SITE-20260316-DEV01-110',
      caseType: 'TOX',
    });

    const alphaCase = await request(app.getHttpServer()).post('/cases').set('x-tenant-id', 'alpha').send({
      clientCaseUuid: randomUUID(),
      temporaryCaseNumber: 'TMP-ALPHA-SITE-20260316-DEV01-110',
      caseType: 'TOX',
    });

    const upsertDemo = await request(app.getHttpServer()).put('/offline/sync-sessions').set('x-tenant-id', 'demo').send({
      caseId: demoCase.body.id,
      userId: 'field-user-1',
      deviceId: 'device-demo-1',
      syncState: 'Syncing',
    });

    const upsertDemoSynced = await request(app.getHttpServer()).put('/offline/sync-sessions').set('x-tenant-id', 'demo').send({
      caseId: demoCase.body.id,
      userId: 'field-user-1',
      deviceId: 'device-demo-1',
      syncState: 'Synced',
    });

    await request(app.getHttpServer()).put('/offline/sync-sessions').set('x-tenant-id', 'alpha').send({
      caseId: alphaCase.body.id,
      userId: 'field-user-2',
      deviceId: 'device-alpha-1',
      syncState: 'Error',
      lastErrorCode: 'UPLOAD_FAILED',
      lastErrorMessage: 'media upload timeout',
    });

    const demoList = await request(app.getHttpServer())
      .get('/offline/sync-sessions?page=1&pageSize=10&syncState=Synced')
      .set('x-tenant-id', 'demo');
    const alphaList = await request(app.getHttpServer())
      .get('/offline/sync-sessions?page=1&pageSize=10&syncState=Error')
      .set('x-tenant-id', 'alpha');

    assert.equal(upsertDemo.status, 200);
    assert.equal(upsertDemoSynced.status, 200);
    assert.equal(demoList.status, 200);
    assert.equal(alphaList.status, 200);
    assert.equal(demoList.body.total, 1);
    assert.equal(alphaList.body.total, 1);
    assert.equal(demoList.body.items[0].syncState, 'Synced');
    assert.equal(alphaList.body.items[0].syncState, 'Error');
  });

  it('ingests offline audit event batches', async () => {
    const ingest = await request(app.getHttpServer())
      .post('/offline/audit-events/batch')
      .set('x-tenant-id', 'demo')
      .send({
        events: [
          {
            userId: 'field-user-1',
            deviceId: 'device-demo-1',
            eventType: 'photo_captured',
            eventPayload: { count: 2 },
            eventAt: '2026-03-16T15:00:00.000Z',
          },
          {
            userId: 'field-user-1',
            deviceId: 'device-demo-1',
            eventType: 'case_note_updated',
            eventPayload: { noteLength: 120 },
            eventAt: '2026-03-16T15:01:00.000Z',
          },
        ],
      });

    assert.equal(ingest.status, 201);
    assert.equal(ingest.body.ingested, 2);
  });
});