import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { OfflineDeviceGrantEntity, TenantLabEntity, TenantLabRoutingAuditEntity, TenantRegistryEntity, } from './entities/index.js';
import { InitControlPlane1710600000000 } from './migrations/1710600000000-init-control-plane.js';
import { ControlPlaneLabRouting1710600003000 } from './migrations/1710600003000-control-plane-lab-routing.js';
import { ControlPlaneOfflineGrants1710600005000 } from './migrations/1710600005000-control-plane-offline-grants.js';
export const controlPlaneDataSource = new DataSource({
    type: 'postgres',
    host: process.env.CONTROL_DB_HOST ?? 'localhost',
    port: Number(process.env.CONTROL_DB_PORT ?? 5432),
    username: process.env.CONTROL_DB_USER ?? 'postgres',
    password: process.env.CONTROL_DB_PASSWORD ?? 'postgres',
    database: process.env.CONTROL_DB_NAME ?? 'emedex_control',
    entities: [TenantRegistryEntity, TenantLabEntity, TenantLabRoutingAuditEntity, OfflineDeviceGrantEntity],
    migrations: [InitControlPlane1710600000000, ControlPlaneLabRouting1710600003000, ControlPlaneOfflineGrants1710600005000],
    synchronize: false,
});
export default controlPlaneDataSource;
