var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { TenantLabEntity } from '../persistence/entities/control-plane.entity.js';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import { TENANT_REPOSITORY_RESOLVER, } from '../tenancy/tenant-repository.port.js';
let LabsService = class LabsService {
    tenantDataSourceResolverService;
    tenantLabRepository;
    constructor(tenantDataSourceResolverService, tenantLabRepository) {
        this.tenantDataSourceResolverService = tenantDataSourceResolverService;
        this.tenantLabRepository = tenantLabRepository;
    }
    async listLabOrders(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getLabOrderRepository(tenant);
        const where = {
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
    async createLabOrder(request, payload) {
        const tenant = getTenantContextFromRequest(request);
        const caseRepository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
        const orderRepository = await this.tenantDataSourceResolverService.getLabOrderRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: payload.caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found for lab order: ${payload.caseId}`);
        }
        const resolvedLabCode = await this.resolveLabCode(tenant.tenantId, payload, caseRecord);
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
    async resolveLabCode(tenantId, payload, caseRecord) {
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
        const requestedCaseType = typeof routingContext.caseType === 'string' && routingContext.caseType.trim().length > 0
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
    scoreLabRules(rawRules, request) {
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
    toStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item) => typeof item === 'string');
    }
    async listHl7Messages(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getHl7MessageRepository(tenant);
        const where = {
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
    async ingestHl7Message(request, payload) {
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
                await unmatchedRepository.save(unmatchedRepository.create({
                    tenantId: tenant.tenantId,
                    labCode: payload.labCode,
                    hl7MessageId: String(created.id),
                    messageControlId,
                    payloadHash,
                    status: 'Open',
                    matchedCaseId: null,
                    matchedBy: null,
                    matchedAt: null,
                    rejectedReason: null,
                    rejectedBy: null,
                    rejectedAt: null,
                }));
            }
        }
        return created;
    }
    async listUnmatchedResults(request, query) {
        const tenant = getTenantContextFromRequest(request);
        const repository = await this.tenantDataSourceResolverService.getHl7UnmatchedResultRepository(tenant);
        const where = {
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
    async matchUnmatchedResult(request, unmatchedResultId, payload) {
        const tenant = getTenantContextFromRequest(request);
        const actorSubject = this.getActorSubject(request);
        const unmatchedRepository = await this.tenantDataSourceResolverService.getHl7UnmatchedResultRepository(tenant);
        const caseRepository = await this.tenantDataSourceResolverService.getCaseRepository(tenant);
        const unmatched = (await unmatchedRepository.findOne({
            where: { id: unmatchedResultId, tenantId: tenant.tenantId },
        }));
        if (!unmatched) {
            throw new NotFoundException(`Unmatched result not found: ${unmatchedResultId}`);
        }
        const caseRecord = await caseRepository.findOne({
            where: { id: payload.caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found for matching: ${payload.caseId}`);
        }
        const matched = await unmatchedRepository.save(unmatchedRepository.create({
            ...unmatched,
            status: 'Matched',
            matchedCaseId: payload.caseId,
            matchedBy: actorSubject,
            matchedAt: new Date(),
            rejectedReason: null,
            rejectedBy: null,
            rejectedAt: null,
        }));
        await this.writeAuditEvent(request, {
            eventType: 'hl7_unmatched_result_matched',
            targetType: 'hl7_unmatched_result',
            targetId: unmatchedResultId,
            beforeState: unmatched,
            afterState: matched,
        });
        return matched;
    }
    async rejectUnmatchedResult(request, unmatchedResultId, payload) {
        const tenant = getTenantContextFromRequest(request);
        const actorSubject = this.getActorSubject(request);
        const unmatchedRepository = await this.tenantDataSourceResolverService.getHl7UnmatchedResultRepository(tenant);
        const unmatched = (await unmatchedRepository.findOne({
            where: { id: unmatchedResultId, tenantId: tenant.tenantId },
        }));
        if (!unmatched) {
            throw new NotFoundException(`Unmatched result not found: ${unmatchedResultId}`);
        }
        const rejected = await unmatchedRepository.save(unmatchedRepository.create({
            ...unmatched,
            status: 'Rejected',
            rejectedReason: payload.reason ?? null,
            rejectedBy: actorSubject,
            rejectedAt: new Date(),
            matchedCaseId: null,
            matchedBy: null,
            matchedAt: null,
        }));
        await this.writeAuditEvent(request, {
            eventType: 'hl7_unmatched_result_rejected',
            targetType: 'hl7_unmatched_result',
            targetId: unmatchedResultId,
            beforeState: unmatched,
            afterState: rejected,
        });
        return rejected;
    }
    extractMessageControlId(rawMessage) {
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
    extractMessageType(rawMessage) {
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
    getActorSubject(request) {
        try {
            const principal = getAuthPrincipalFromRequest(request);
            return principal.subject;
        }
        catch {
            const requestWithAuth = request;
            return requestWithAuth.auth?.subject ?? 'system';
        }
    }
    async writeAuditEvent(request, input) {
        const tenant = getTenantContextFromRequest(request);
        const auditRepository = await this.tenantDataSourceResolverService.getAuditEventRepository(tenant);
        const actorSubject = this.getActorSubject(request);
        const requestWithAuth = request;
        await auditRepository.save(auditRepository.create({
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
        }));
    }
};
LabsService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __param(1, InjectRepository(TenantLabEntity)),
    __metadata("design:paramtypes", [Object, Function])
], LabsService);
export { LabsService };
