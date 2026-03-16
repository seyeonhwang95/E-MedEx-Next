import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { apiErrorCodes } from '../common/api-error-codes.js';
import { getAuthPrincipalFromRequest, getTenantContextFromRequest } from '../tenancy/request-context.js';
import type { TenantContext } from '../tenancy/tenant-context.js';
import {
  TENANT_REPOSITORY_RESOLVER,
  type TenantRepositoryResolverPort,
} from '../tenancy/tenant-repository.port.js';
import type { GenerateReportDto } from './dto/generate-report.dto.js';

type ProtocolVersionRecord = {
  status: 'Draft' | 'Review' | 'Final';
  versionNo: number;
  protocolBody: string | null;
};

type CaseReportRecord = {
  id: string;
  tenantId: string;
  caseId: string;
  versionNo: number;
  status: 'Generated' | 'Signed' | 'Exported';
  reportBody: string | null;
  signedBy: string | null;
  signedAt: Date | null;
  exportedAt: Date | null;
};

@Injectable()
export class ReportsService {
  constructor(
    @Inject(TENANT_REPOSITORY_RESOLVER)
    private readonly tenantRepositoryResolver: TenantRepositoryResolverPort,
  ) {}

  async listReports(request: Request, caseId: string) {
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

  async generateReport(request: Request, caseId: string, payload: GenerateReportDto) {
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
    const nextVersionNo = (Number((latestReports[0] as Record<string, unknown> | undefined)?.versionNo ?? 0) || 0) + 1;

    const [protocols] = await protocolRepository.findAndCount({
      where: { tenantId: tenant.tenantId, caseId },
      order: { versionNo: 'DESC' },
      skip: 0,
      take: 1,
    });
    const protocol = (protocols[0] as ProtocolVersionRecord | undefined) ?? null;

    const reportBody = this.buildReportBody(caseId, nextVersionNo, protocol?.protocolBody ?? null, payload.templateId);

    const created = await reportRepository.save(
      reportRepository.create({
        tenantId: tenant.tenantId,
        caseId,
        versionNo: nextVersionNo,
        status: 'Generated',
        reportBody,
        signedBy: null,
        signedAt: null,
        exportedAt: null,
      }),
    );

    await this.writeAuditEvent(request, {
      eventType: 'report_generated',
      targetType: 'report',
      targetId: String((created as Record<string, unknown>).id),
      beforeState: null,
      afterState: created as Record<string, unknown>,
    });

    return created;
  }

  async signLatestReport(request: Request, caseId: string) {
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
    const signed = await reportRepository.save(
      reportRepository.create({
        ...report,
        status: 'Signed',
        signedBy: actorSubject,
        signedAt: report.signedAt ?? new Date(),
      }),
    );

    await this.writeAuditEvent(request, {
      eventType: 'report_signed',
      targetType: 'report',
      targetId: report.id,
      beforeState: report as unknown as Record<string, unknown>,
      afterState: signed as Record<string, unknown>,
    });

    return signed;
  }

  async exportLatestReport(request: Request, caseId: string) {
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
    const hasFinalProtocol = protocols.some((item) => (item as ProtocolVersionRecord).status === 'Final');

    if (!hasFinalProtocol) {
      throw new BadRequestException({
        code: apiErrorCodes.ReportExportProtocolNotFinal,
        message: 'Export blocked until protocol is finalized',
      });
    }

    const exported = await reportRepository.save(
      reportRepository.create({
        ...report,
        status: 'Exported',
        exportedAt: new Date(),
      }),
    );

    await this.writeAuditEvent(request, {
      eventType: 'report_exported',
      targetType: 'report',
      targetId: report.id,
      beforeState: report as unknown as Record<string, unknown>,
      afterState: exported as Record<string, unknown>,
    });

    return {
      report: exported,
      export: {
        fileName: `case-${caseId}-report-v${report.versionNo}.pdf`,
        mimeType: 'application/pdf',
      },
    };
  }

  private async getLatestReport(tenantId: string, caseId: string, tenant: TenantContext) {
    const reportRepository = await this.tenantRepositoryResolver.getCaseReportRepository(tenant);
    const [items] = await reportRepository.findAndCount({
      where: { tenantId, caseId },
      order: { versionNo: 'DESC' },
      skip: 0,
      take: 1,
    });

    return (items[0] as CaseReportRecord | undefined) ?? null;
  }

  private buildReportBody(caseId: string, versionNo: number, protocolBody: string | null, templateId?: string) {
    const templateRef = templateId?.trim() ? `Template: ${templateId}` : 'Template: default';
    const protocolSnapshot = protocolBody?.trim() ? protocolBody : 'Protocol snapshot unavailable';

    return `${templateRef}\nCase: ${caseId}\nVersion: ${versionNo}\n\n${protocolSnapshot}`;
  }

  private async ensureCaseExists(tenant: TenantContext, caseId: string) {
    const caseRepository = await this.tenantRepositoryResolver.getCaseRepository(tenant);
    const caseRecord = await caseRepository.findOne({
      where: { id: caseId, tenantId: tenant.tenantId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case not found: ${caseId}`);
    }
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
    const auditRepository = await this.tenantRepositoryResolver.getAuditEventRepository(tenant);
    const actorSubject = this.getActorSubject(request);
    const requestWithAuth = request as Request & { auth?: { roles?: string[]; claims?: Record<string, unknown> } };

    await auditRepository.save(
      auditRepository.create({
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
      }),
    );
  }
}