# API Persistence Scaffold

This folder contains TypeORM scaffolding for the modernization baseline.

## Data sources

- `control-plane.datasource.ts` for tenant registry metadata
- `tenant-data.datasource.ts` for tenant PHI/case data

## Migrations

- `1710600000000-init-control-plane.ts`
- `1710600001000-init-tenant-data.ts`

## Commands

- `pnpm --filter @emedex/api typeorm:control:migrate`
- `pnpm --filter @emedex/api typeorm:tenant:migrate`

These migrations are intentionally minimal and represent a starting schema only.