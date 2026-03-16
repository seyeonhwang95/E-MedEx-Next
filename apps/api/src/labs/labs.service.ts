import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import type { Request } from 'express';
import { FindOptionsWhere } from 'typeorm';
import type { Repository } from 'typeorm';

import { TenantLabEntity } from '../persistence/entities/control-plane.entity.js';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { CreateLabOrderDto } from './dto/create-lab-order.dto.js';
import type { IngestHl7MessageDto } from './dto/ingest-hl7-message.dto.js';
import type { ListHl7MessagesQueryDto } from './dto/list-hl7-messages-query.dto.js';
import type { ListLabOrdersQueryDto } from './dto/list-lab-orders-query.dto.js';
import type { ListUnmatchedResultsQueryDto } from './dto/list-unmatched-results-query.dto.js';
import type { MatchUnmatchedResultDto } from './dto/match-unmatched-result.dto.js';
import type { RejectUnmatchedResultDto } from './dto/reject-unmatched-result.dto.js';

type LabOrderRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  labCode: string;
  orderNumber: string;
  status: 'Created' | 'Sent' | 'Ack' | 'InProgress' | 'Partial' | 'Final' | 'Verified' | 'Finalized';
  orderedItems: Record<string, unknown>;
  createdAt: Date;
};

type Hl7MessageRecord = {
  id: string;
  tenantId: string;
  labCode: string;
  direction: 'Inbound' | 'Outbound';
  messageType: 'ORM_O01' | 'ORU_R01' | 'ACK';
  messageControlId: string;
  payloadHash: string;
  rawMessage: string;
  processingState: 'Received' | 'Validated' | 'Mapped' | 'Failed';
  processingError: string | null;
  createdAt: Date;
};

type Hl7UnmatchedResultRecord = {
  id: string;
  tenantId: string;
  labCode: string;
  hl7MessageId: string;
  messageControlId: string;
  payloadHash: string;
  status: 'Open' | 'Matched' | 'Rejected';
  matchedCaseId: string | null;
  matchedBy: string | null;
  matchedAt: Date | null;
  rejectedReason: string | null;
  rejectedBy: string | null;
  rejectedAt: Date | null;
  createdAt: Date;
};

@Injectable()
export class LabsService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantDataSourceResolverService: TenantRepositoryResolverPort,
    @InjectRepository(TenantLabEntity)
    private readonly tenantLabRepository: Repository<TenantLabEntity>,
  ) {}

  async listLabOrders(request: Request, query: ListLabOrdersQueryDto) {
    const tenant = getTenantContextFromRequest(request);
    const repository = await this.tenantDataSourceResolverService.getLabOrderRepository(tenant);

    const where: FindOptionsWhere<LabOrderRecord> = {
      tenantId: tenant.tenantId,
      ...(query.labCode ? { labCode: query.labCode } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: query.pageSize,
    });

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async createLabOrder(request: Request, payload: CreateLabOrderDto) {
    const tenant = getTenantContextFromRequest(request);
    const caseRepository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
    const orderRepository = await this.tenantDataSourceResolverService.getLabOrderRepository(tenant);

    const caseRecord = await caseRepository.findOne({
      where: { id: payload.caseId, tenantId: tenant.tenantId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found for lab order: ${payload.caseId}`);
    }

    const resolvedLabCode = await this.resolveLabCode(tenant.tenantId, payload, caseRecord as Record<string, unknown>);

    const entity = orderRepository.create({
      tenantId: tenant.tenantId,
      caseId: payload.caseId,
      labCode: resolvedLabCode,
      orderNumber: payload.orderNumber,
      status: 'Created',
      orderedItems: payload.orderedItems,
    });

    return orderRepository.save(entity);
  }

  private async resolveLabCode(
    tenantId: string,
    payload: CreateLabOrderDto,
    caseRecord: Record<string, unknown>,
  ): Promise<string> {
    const activeLabs = await this.tenantLabRepository.find({
      where: {
        tenantId,
        isActive: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (payload.labCode) {
      const explicitLabCode = payload.labCode.toUpperCase();

      if (activeLabs.length === 0) {
        return explicitLabCode;
      }

      const explicitMatch = activeLabs.find((lab) => lab.labCode === explicitLabCode);
      if (!explicitMatch) {
        throw new NotFoundException(`Lab not active or not configured for tenant: ${explicitLabCode}`);
      }

      return explicitMatch.labCode;
    }

    if (activeLabs.length === 0) {
      throw new NotFoundException(`No active labs configured for tenant: ${tenantId}`);
    }

    const routingContext = payload.routingContext ?? {};
    const requestedCaseType =
      typeof routingContext.caseType === 'string' && routingContext.caseType.trim().length > 0
        ? routingContext.caseType
        : typeof caseRecord.caseType === 'string'
          ? caseRecord.caseType
          : undefined;

    const candidates = activeLabs
      .map((lab) => ({
        lab,
        score: this.scoreLabRules(lab.routingRules, {
          testType: routingContext.testType,
          specimenType: routingContext.specimenType,
          caseType: requestedCaseType,
          agency: routingContext.agency,
          priority: routingContext.priority,
        }),
      }))
      .filter((item) => item.score >= 0)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return left.lab.labCode.localeCompare(right.lab.labCode);
      });

    return (candidates[0]?.lab ?? activeLabs[0]).labCode;
  }

  private scoreLabRules(
    rawRules: Record<string, unknown> | null,
    request: {
      testType?: string;
      specimenType?: string;
      caseType?: string;
      agency?: string;
      priority?: boolean;
    },
  ): number {
    const rules = rawRules ?? {};
    let score = 0;

    const testTypes = this.toStringArray(rules.testTypes);
    const specimenTypes = this.toStringArray(rules.specimenTypes);
    const caseTypes = this.toStringArray(rules.caseTypes);
    const agencies = this.toStringArray(rules.agencies);
    const priorityOnly = rules.priorityOnly === true;
    const priorityWeight = typeof rules.priority === 'number' ? rules.priority : 0;

    if (priorityOnly && !request.priority) {
      return -1;
    }

    if (testTypes.length > 0) {
      if (!request.testType || !testTypes.includes(request.testType)) {
        return -1;
      }
      score += 4;
    }

    if (specimenTypes.length > 0) {
      if (!request.specimenType || !specimenTypes.includes(request.specimenType)) {
        return -1;
      }
      score += 3;
    }

    if (caseTypes.length > 0) {
      if (!request.caseType || !caseTypes.includes(request.caseType)) {
        return -1;
      }
      score += 3;
    }

    if (agencies.length > 0) {
      if (!request.agency || !agencies.includes(request.agency)) {
        return -1;
      }
      score += 2;
    }

    if (request.priority && priorityOnly) {
      score += 1;
    }

    score += priorityWeight;
    return score;
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }

  async listHl7Messages(request: Request, query: ListHl7MessagesQueryDto) {
    const tenant = getTenantContextFromRequest(request);
    const repository = await this.tenantDataSourceResolverService.getHl7MessageRepository(tenant);

    const where: FindOptionsWhere<Hl7MessageRecord> = {
      tenantId: tenant.tenantId,
      ...(query.labCode ? { labCode: query.labCode } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
      ...(query.messageType ? { messageType: query.messageType } : {}),
      ...(query.processingState ? { processingState: query.processingState } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: query.pageSize,
    });

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async ingestHl7Message(request: Request, payload: IngestHl7MessageDto) {
    const tenant = getTenantContextFromRequest(request);
    const messageRepository = await this.tenantDataSourceResolverService.getHl7MessageRepository(tenant);
    const unmatchedRepository = await this.tenantDataSourceResolverService.getHl7UnmatchedResultRepository(tenant);

    const messageControlId = this.extractMessageControlId(payload.rawMessage);
    const messageType = this.extractMessageType(payload.rawMessage);
    const payloadHash = createHash('sha256').update(payload.rawMessage).digest('hex');

    const existing = await messageRepository.findOne({
      where: {
        tenantId: tenant.tenantId,
        labCode: payload.labCode,
        messageControlId,
        payloadHash,
      },
    });

    if (existing) {
      return existing;
    }

    const entity = messageRepository.create({
      tenantId: tenant.tenantId,
      labCode: payload.labCode,
      direction: payload.direction,
      messageType,
      messageControlId,
      payloadHash,
      rawMessage: payload.rawMessage,
      processingState: 'Received',
      processingError: null,
    });

    const created = await messageRepository.save(entity);

    if (messageType === 'ORU_R01' && payload.direction === 'Inbound') {
      const existingUnmatched = await unmatchedRepository.findOne({
        where: {
          tenantId: tenant.tenantId,
          labCode: payload.labCode,
          messageControlId,
          payloadHash,
        },
      });

      if (!existingUnmatched) {
        await unmatchedRepository.save(
          unmatchedRepository.create({
            tenantId: tenant.tenantId,
            labCode: payload.labCode,
            hl7MessageId: String((created as Record<string, unknown>).id),
            messageControlId,
            payloadHash,
            status: 'Open',
            matchedCaseId: null,
            matchedBy: null,
            matchedAt: null,
            rejectedReason: null,
            rejectedBy: null,
            rejectedAt: null,
          }),
        );
      }
    }

    return created;
  }

  async listUnmatchedResults(request: Request, query: ListUnmatchedResultsQueryDto) {
    const tenant = getTenantContextFromRequest(request);
    const repository = await this.tenantDataSourceResolverService.getHl7UnmatchedResultRepository(tenant);

    const where: FindOptionsWhere<Hl7UnmatchedResultRecord> = {
      tenantId: tenant.tenantId,
      ...(query.labCode ? { labCode: query.labCode } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: query.pageSize,
    });

    await this.writeAuditEvent(request, {
      eventType: 'hl7_unmatched_queue_viewed',
      targetType: 'hl7_unmatched_results',
      targetId: tenant.tenantId,
      beforeState: null,
      afterState: {
        labCode: query.labCode ?? null,
        status: query.status ?? null,
        count: total,
      },
    });

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async matchUnmatchedResult(request: Request, unmatchedResultId: string, payload: MatchUnmatchedResultDto) {
    const tenant = getTenantContextFromRequest(request);
    const actorSubject = this.getActorSubject(request);
    const unmatchedRepository = await this.tenantDataSourceResolverService.getHl7UnmatchedResultRepository(tenant);
    const caseRepository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);

    const unmatched = (await unmatchedRepository.findOne({
      where: { id: unmatchedResultId, tenantId: tenant.tenantId },
    })) as Hl7UnmatchedResultRecord | null;

    if (!unmatched) {
      throw new NotFoundException(`Unmatched result not found: ${unmatchedResultId}`);
    }

    const caseRecord = await caseRepository.findOne({
      where: { id: payload.caseId, tenantId: tenant.tenantId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found for matching: ${payload.caseId}`);
    }

    const matched = await unmatchedRepository.save(
      unmatchedRepository.create({
        ...unmatched,
        status: 'Matched',
        matchedCaseId: payload.caseId,
        matchedBy: actorSubject,
        matchedAt: new Date(),
        rejectedReason: null,
        rejectedBy: null,
        rejectedAt: null,
      }),
    );

    await this.writeAuditEvent(request, {
      eventType: 'hl7_unmatched_result_matched',
      targetType: 'hl7_unmatched_result',
      targetId: unmatchedResultId,
      beforeState: unmatched as unknown as Record<string, unknown>,
      afterState: matched as unknown as Record<string, unknown>,
    });

    return matched;
  }

  async rejectUnmatchedResult(request: Request, unmatchedResultId: string, payload: RejectUnmatchedResultDto) {
    const tenant = getTenantContextFromRequest(request);
    const actorSubject = this.getActorSubject(request);
    const unmatchedRepository = await this.tenantDataSourceResolverService.getHl7UnmatchedResultRepository(tenant);

    const unmatched = (await unmatchedRepository.findOne({
      where: { id: unmatchedResultId, tenantId: tenant.tenantId },
    })) as Hl7UnmatchedResultRecord | null;

    if (!unmatched) {
      throw new NotFoundException(`Unmatched result not found: ${unmatchedResultId}`);
    }

    const rejected = await unmatchedRepository.save(
      unmatchedRepository.create({
        ...unmatched,
        status: 'Rejected',
        rejectedReason: payload.reason ?? null,
        rejectedBy: actorSubject,
        rejectedAt: new Date(),
        matchedCaseId: null,
        matchedBy: null,
        matchedAt: null,
      }),
    );

    await this.writeAuditEvent(request, {
      eventType: 'hl7_unmatched_result_rejected',
      targetType: 'hl7_unmatched_result',
      targetId: unmatchedResultId,
      beforeState: unmatched as unknown as Record<string, unknown>,
      afterState: rejected as unknown as Record<string, unknown>,
    });

    return rejected;
  }

  private extractMessageControlId(rawMessage: string): string {
    const mshSegment = rawMessage
      .split(/\r?\n|\r/)
      .map((line) => line.trim())
      .find((line) => line.startsWith('MSH|'));

    if (!mshSegment) {
      return 'UNKNOWN';
    }

    const fields = mshSegment.split('|');
    return fields[9] || 'UNKNOWN';
  }

  private extractMessageType(rawMessage: string): Hl7MessageRecord['messageType'] {
    const mshSegment = rawMessage
      .split(/\r?\n|\r/)
      .map((line) => line.trim())
      .find((line) => line.startsWith('MSH|'));

    if (!mshSegment) {
      return 'ACK';
    }

    const fields = mshSegment.split('|');
    const typeToken = fields[8] || '';

    if (typeToken.startsWith('ORM^O01')) {
      return 'ORM_O01';
    }

    if (typeToken.startsWith('ORU^R01')) {
      return 'ORU_R01';
    }

    return 'ACK';
  }

  private getActorSubject(request: Request): string {
    try {
      const principal = getAuthPrincipalFromRequest(request);
      return principal.subject;
    } catch {
      const requestWithAuth = request as Request & { auth?: { subject?: string } };
      return requestWithAuth.auth?.subject ?? 'system';
    }
  }

  private async writeAuditEvent(
    request: Request,
    input: {
      eventType: string;
      targetType: string;
      targetId: string;
      beforeState: Record<string, unknown> | null;
      afterState: Record<string, unknown> | null;
    },
  ) {
    const tenant = getTenantContextFromRequest(request);
    const auditRepository = await this.tenantDataSourceResolverService.getAuditEventRepository(tenant);
    const actorSubject = this.getActorSubject(request);
    const requestWithAuth = request as Request & { auth?: { roles?: string[]; claims?: Record<string, unknown> } };

    await auditRepository.save(
      auditRepository.create({
        tenantId: tenant.tenantId,
        actorSubject,
        actorRoles: Array.isArray(requestWithAuth.auth?.roles) ? requestWithAuth.auth.roles : null,
        deviceId: requestWithAuth.auth?.claims?.device_id ? String(requestWithAuth.auth.claims.device_id) : null,
        ipAddress: request.ip ?? request.socket.remoteAddress ?? null,
        eventType: input.eventType,
        targetType: input.targetType,
        targetId: input.targetId,
        beforeState: input.beforeState,
        afterState: input.afterState,
      }),
    );
  }
}