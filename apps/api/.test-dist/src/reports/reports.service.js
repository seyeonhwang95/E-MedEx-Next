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
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { apiErrorCodes } from '../common/api-error-codes.js';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import { TENANT_REPOSITORY_RESOLVER, } from '../tenancy/tenant-repository.port.js';
let ReportsService = class ReportsService {
    tenantRepositoryResolver;
    constructor(tenantRepositoryResolver) {
        this.tenantRepositoryResolver = tenantRepositoryResolver;
    }
    async listReports(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const reportRepository = await this.tenantRepositoryResolver.getCaseReportRepository(tenant);
        const [items, total] = await reportRepository.findAndCount({
            where: { tenantId: tenant.tenantId, caseId },
            order: { versionNo: 'DESC' },
            skip: 0,
            take: 100,
        });
        await this.writeAuditEvent(request, {
            eventType: 'report_view',
            targetType: 'case',
            targetId: caseId,
            beforeState: null,
            afterState: {
                reportCount: total,
            },
        });
        return { items, total };
    }
    async generateReport(request, caseId, payload) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const reportRepository = await this.tenantRepositoryResolver.getCaseReportRepository(tenant);
        const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
        const [latestReports] = await reportRepository.findAndCount({
            where: { tenantId: tenant.tenantId, caseId },
            order: { versionNo: 'DESC' },
            skip: 0,
            take: 1,
        });
        const nextVersionNo = (Number(latestReports[0]?.versionNo ?? 0) || 0) + 1;
        const [protocols] = await protocolRepository.findAndCount({
            where: { tenantId: tenant.tenantId, caseId },
            order: { versionNo: 'DESC' },
            skip: 0,
            take: 1,
        });
        const protocol = protocols[0] ?? null;
        const reportBody = this.buildReportBody(caseId, nextVersionNo, protocol?.protocolBody ?? null, payload.templateId);
        const created = await reportRepository.save(reportRepository.create({
            tenantId: tenant.tenantId,
            caseId,
            versionNo: nextVersionNo,
            status: 'Generated',
            reportBody,
            signedBy: null,
            signedAt: null,
            exportedAt: null,
        }));
        await this.writeAuditEvent(request, {
            eventType: 'report_generated',
            targetType: 'report',
            targetId: String(created.id),
            beforeState: null,
            afterState: created,
        });
        return created;
    }
    async signLatestReport(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const reportRepository = await this.tenantRepositoryResolver.getCaseReportRepository(tenant);
        const report = await this.getLatestReport(tenant.tenantId, caseId, tenant);
        if (!report) {
            throw new NotFoundException(`No report exists for case: ${caseId}`);
        }
        if (report.status === 'Exported') {
            return report;
        }
        const actorSubject = this.getActorSubject(request);
        const signed = await reportRepository.save(reportRepository.create({
            ...report,
            status: 'Signed',
            signedBy: actorSubject,
            signedAt: report.signedAt ?? new Date(),
        }));
        await this.writeAuditEvent(request, {
            eventType: 'report_signed',
            targetType: 'report',
            targetId: report.id,
            beforeState: report,
            afterState: signed,
        });
        return signed;
    }
    async exportLatestReport(request, caseId) {
        const tenant = getTenantContextFromRequest(request);
        await this.ensureCaseExists(tenant, caseId);
        const reportRepository = await this.tenantRepositoryResolver.getCaseReportRepository(tenant);
        const protocolRepository = await this.tenantRepositoryResolver.getProtocolVersionRepository(tenant);
        const report = await this.getLatestReport(tenant.tenantId, caseId, tenant);
        if (!report) {
            throw new NotFoundException(`No report exists for case: ${caseId}`);
        }
        if (report.status === 'Generated') {
            throw new BadRequestException({
                code: apiErrorCodes.ReportExportReportNotSigned,
                message: 'Report must be signed before export',
            });
        }
        const [protocols] = await protocolRepository.findAndCount({
            where: { tenantId: tenant.tenantId, caseId },
            order: { versionNo: 'DESC' },
            skip: 0,
            take: 20,
        });
        const hasFinalProtocol = protocols.some((item) => item.status === 'Final');
        if (!hasFinalProtocol) {
            throw new BadRequestException({
                code: apiErrorCodes.ReportExportProtocolNotFinal,
                message: 'Export blocked until protocol is finalized',
            });
        }
        const exported = await reportRepository.save(reportRepository.create({
            ...report,
            status: 'Exported',
            exportedAt: new Date(),
        }));
        await this.writeAuditEvent(request, {
            eventType: 'report_exported',
            targetType: 'report',
            targetId: report.id,
            beforeState: report,
            afterState: exported,
        });
        return {
            report: exported,
            export: {
                fileName: `case-${caseId}-report-v${report.versionNo}.pdf`,
                mimeType: 'application/pdf',
            },
        };
    }
    async getLatestReport(tenantId, caseId, tenant) {
        const reportRepository = await this.tenantRepositoryResolver.getCaseReportRepository(tenant);
        const [items] = await reportRepository.findAndCount({
            where: { tenantId, caseId },
            order: { versionNo: 'DESC' },
            skip: 0,
            take: 1,
        });
        return items[0] ?? null;
    }
    buildReportBody(caseId, versionNo, protocolBody, templateId) {
        const templateRef = templateId?.trim() ? `Template: ${templateId}` : 'Template: default';
        const protocolSnapshot = protocolBody?.trim() ? protocolBody : 'Protocol snapshot unavailable';
        return `${templateRef}\nCase: ${caseId}\nVersion: ${versionNo}\n\n${protocolSnapshot}`;
    }
    async ensureCaseExists(tenant, caseId) {
        const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
        const caseRecord = await caseRepository.findOne({
            where: { id: caseId, tenantId: tenant.tenantId },
        });
        if (!caseRecord) {
            throw new NotFoundException(`Case not found: ${caseId}`);
        }
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
        const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
        const actorSubject = this.getActorSubject(request);
        const requestWithAuth = request;
        await auditRepository.save(auditRepository.create({
            tenantId: tenant.tenantId,
            actorSubject,
            actorRoles: Array.isArray(requestWithAuth.auth?.roles) ? requestWithAuth.auth?.roles : null,
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
ReportsService = __decorate([
    Injectable(),
    __param(0, Inject(TENANT_REPOSITORY_RESOLVER)),
    __metadata("design:paramtypes", [Object])
], ReportsService);
export { ReportsService };
