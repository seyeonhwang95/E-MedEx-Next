# E-MedEx Next Architecture Scaffold

## Monorepo layout

- `apps/api` — control-plane aware NestJS API
- `apps/web` — modular monolith SPA
- `apps/mobile` — offline field intake mobile shell
- `apps/desktop` — offline field intake desktop shell
- `apps/hl7-gateway` — MLLP ingress/egress service
- `packages/domain` — shared contracts and enums
- `packages/theme` — cross-platform tokens
- `packages/ui-web` — web component package
- `packages/ui-native` — native component package

## Platform boundaries

### Control plane

Stores:

- tenant registry
- tenant subdomain routing
- tenant DB connection references
- auth provider references
- lab registration metadata

### Tenant data plane

Each tenant receives:

- isolated Postgres database
- storage prefix: `emedex-media/<tenantId>/...`
- search index prefix: `emedex-<tenantId>-*`
- tenant-scoped audit context

## Domain modules

- case management
- investigation
- evidence and custody
- specimen and lab orders
- lab results and reconciliation
- pathology/protocol authoring
- media
- cremation
- indigent burial
- audit and reporting

## Delivery phases

1. Scaffold control plane, tenant routing, auth abstraction
2. Build intake + case workspace + audit foundation
3. Add offline sync for mobile and desktop
4. Add HL7 gateway, reconciliation, and performance gates
5. Expand reporting, policy controls, and admin tooling