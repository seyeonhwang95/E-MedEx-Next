var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { RolesGuard } from './auth/roles.guard.js';
import { CasesController } from './cases/cases.controller.js';
import { CasesService } from './cases/cases.service.js';
import { CremationController } from './cremation/cremation.controller.js';
import { CremationService } from './cremation/cremation.service.js';
import { TenantAdminController } from './control-plane/tenant-admin.controller.js';
import { OfflineGrantsController } from './control-plane/offline-grants.controller.js';
import { OfflineGrantsService } from './control-plane/offline-grants.service.js';
import { TenantProvisioningService } from './control-plane/tenant-provisioning.service.js';
import { EvidenceController } from './evidence/evidence.controller.js';
import { EvidenceService } from './evidence/evidence.service.js';
import { HealthController } from './health/health.controller.js';
import { InvestigationsController } from './investigations/investigations.controller.js';
import { InvestigationsService } from './investigations/investigations.service.js';
import { IndigentController } from './indigent/indigent.controller.js';
import { IndigentService } from './indigent/indigent.service.js';
import { LabsController } from './labs/labs.controller.js';
import { LabsService } from './labs/labs.service.js';
import { MediaController } from './media/media.controller.js';
import { MediaService } from './media/media.service.js';
import { OfflineController } from './offline/offline.controller.js';
import { OfflineService } from './offline/offline.service.js';
import { TenantLabEntity, TenantLabRoutingAuditEntity, TenantRegistryEntity } from './persistence/entities/index.js';
import { OfflineDeviceGrantEntity } from './persistence/entities/control-plane.entity.js';
import { PoliceHoldsController } from './police-holds/police-holds.controller.js';
import { PoliceHoldsService } from './police-holds/police-holds.service.js';
import { ProtocolsController } from './protocols/protocols.controller.js';
import { ProtocolsService } from './protocols/protocols.service.js';
import { ReferenceController } from './reference/reference.controller.js';
import { ReferenceService } from './reference/reference.service.js';
import { ReportsController } from './reports/reports.controller.js';
import { ReportsService } from './reports/reports.service.js';
import { TenantResolutionMiddleware } from './tenancy/tenant.middleware.js';
import { TenantDataSourceResolverService } from './tenancy/tenant-datasource-resolver.service.js';
import { TENANT_REPOSITORY_RESOLVER } from './tenancy/tenant-repository.port.js';
import { TenantRegistryService } from './tenancy/tenant-registry.service.js';
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(TenantResolutionMiddleware).forRoutes('*path');
    }
};
AppModule = __decorate([
    Module({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.CONTROL_DB_HOST ?? 'localhost',
                port: Number(process.env.CONTROL_DB_PORT ?? 5432),
                username: process.env.CONTROL_DB_USER ?? 'postgres',
                password: process.env.CONTROL_DB_PASSWORD ?? 'postgres',
                database: process.env.CONTROL_DB_NAME ?? 'emedex_control',
                autoLoadEntities: true,
                synchronize: false,
                migrationsRun: true,
                migrations: [
                    'dist/persistence/migrations/**/*.js',
                ],
            }),
            TypeOrmModule.forFeature([TenantRegistryEntity, TenantLabEntity, TenantLabRoutingAuditEntity, OfflineDeviceGrantEntity]),
        ],
        controllers: [
            HealthController,
            TenantAdminController,
            OfflineGrantsController,
            CasesController,
            CremationController,
            EvidenceController,
            IndigentController,
            LabsController,
            MediaController,
            OfflineController,
            InvestigationsController,
            PoliceHoldsController,
            ProtocolsController,
            ReferenceController,
            ReportsController,
        ],
        providers: [
            TenantProvisioningService,
            OfflineGrantsService,
            TenantRegistryService,
            TenantDataSourceResolverService,
            {
                provide: TENANT_REPOSITORY_RESOLVER,
                useExisting: TenantDataSourceResolverService,
            },
            CasesService,
            CremationService,
            EvidenceService,
            IndigentService,
            LabsService,
            MediaService,
            OfflineService,
            InvestigationsService,
            PoliceHoldsService,
            ProtocolsService,
            ReferenceService,
            ReportsService,
            {
                provide: APP_GUARD,
                useClass: JwtAuthGuard,
            },
            {
                provide: APP_GUARD,
                useClass: RolesGuard,
            },
        ],
    })
], AppModule);
export { AppModule };
