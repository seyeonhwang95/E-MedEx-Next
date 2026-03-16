# E-MedEx Next

Modernized scaffold for a multi-tenant Medical Examiner platform based on the unified requirements in [docs/readme.md](docs/readme.md).

## What is included

- `apps/api` — NestJS API scaffold with tenant resolution middleware
- `apps/web` — React + Vite + Tailwind v4 web shell
- `apps/mobile` — Expo React Native field-intake shell
- `apps/desktop` — Electron intake shell
- `apps/hl7-gateway` — HL7 MLLP gateway scaffold
- `packages/theme` — shared design tokens
- `packages/ui-web` — shared web UI primitives
- `packages/ui-native` — shared React Native UI primitives
- `packages/domain` — shared domain types and constants
- `tests/k6` — performance test scaffold
- `samples/hl7` — local HL7 sample messages
- `docker-compose.yml` — local platform dependencies

## Legacy modernization notes

Legacy Broward County source material is preserved under [docs](docs):

- [docs/readme.md](docs/readme.md) — modern target requirements
- [docs/MEDEX RLI.txt](docs/MEDEX%20RLI.txt) — historical Broward County RFP material
- [docs/medextables.sql](docs/medextables.sql) — legacy SQL Anywhere schema
- [docs/legacy-modernization.md](docs/legacy-modernization.md) — legacy-to-modern mapping

## Quick start

1. Install Node.js `22.x` and pnpm `10.x`.
2. Install dependencies:
   - `pnpm install`
3. Start local platform services:
   - `docker compose up -d`
4. Run the apps in separate terminals:
   - `pnpm dev:web`
   - `pnpm dev:api`
   - optional watch mode: `pnpm dev:api:watch`
   - `pnpm dev:gateway`
   - `pnpm dev:desktop`

Single-command local API stack (Docker + API):

- `pnpm dev:api:stack`
- Stops with: `pnpm stop:api:stack`

Desktop built mode (no web dev server):

- `pnpm build:desktop`
- `pnpm dev:desktop:built`
- Internally uses `@emedex/web` script `build:desktop` to emit Electron-compatible relative asset paths.

## Local domains

Add the following hosts entries for tenant routing:

- `127.0.0.1 demo.localhost`
- `127.0.0.1 api.demo.localhost`

## Health checks

- API: `http://localhost:3000/health`
- Web: `http://localhost:5173`
- MinIO console: `http://localhost:9001`
- OpenSearch Dashboards: `http://localhost:5601`

## API scaffold endpoints

- `GET /health`
- `GET /control/tenants` (requires header: `x-roles: platform_admin`)
- `POST /control/tenants` (requires header: `x-roles: platform_admin`)
- `GET /control/tenants/:tenantId/labs` (requires header: `x-roles: platform_admin`)
- `PUT /control/tenants/:tenantId/labs/:labCode` (requires header: `x-roles: platform_admin`)
- `POST /control/tenants/:tenantId/labs/resolve` (requires header: `x-roles: platform_admin`)
- `GET /control/offline-grants` (requires header: `x-roles: platform_admin`)
- `GET /control/offline-grants/:grantId/audit-events` (requires header: `x-roles: platform_admin`)
- `POST /control/offline-grants/enroll` (requires header: `x-roles: platform_admin`)
- `POST /control/offline-grants/validate` (allows `platform_admin` or tenant-scoped device token)
- `POST /control/offline-grants/ack-wipe` (allows `platform_admin` or tenant-scoped device token)
- `POST /control/offline-grants/revoke` (requires header: `x-roles: platform_admin`)
- `GET /cases`
- `GET /cases/:caseId`
- `POST /cases`
- `PATCH /cases/:caseId/status`
- `POST /cases/:caseId/assign-canonical`
- `GET /labs/orders`
- `POST /labs/orders`
- `GET /labs/hl7/messages`
- `POST /labs/hl7/messages`
- `GET /labs/hl7/unmatched-results`
- `POST /labs/hl7/unmatched-results/:unmatchedResultId/match-case`
- `POST /labs/hl7/unmatched-results/:unmatchedResultId/reject`
- `GET /investigations`
- `POST /investigations`
- `GET /police-holds`
- `POST /police-holds`
- `GET /evidence`
- `POST /evidence`
- `GET /evidence/barcode/:barcode`
- `GET /evidence/:evidenceItemId/custody-events`
- `POST /evidence/:evidenceItemId/custody-events`
- `GET /media-assets`
- `GET /media-assets/:mediaAssetId`
- `GET /media-assets/:mediaAssetId/download`
- `POST /media-assets`
- `GET /protocols/:caseId/versions`
- `POST /protocols/:caseId/versions`
- `PUT /protocols/:caseId/versions/:versionNo`
- `POST /protocols/:caseId/versions/:versionNo/submit-review`
- `POST /protocols/:caseId/versions/:versionNo/finalize`
- `GET /cremation-cases/:caseId`
- `PUT /cremation-cases/:caseId`
- `GET /indigent-cases/:caseId`
- `PUT /indigent-cases/:caseId`
- `GET /reference/agencies`
- `POST /reference/agencies`
- `GET /reference/case-types`
- `POST /reference/case-types`
- `GET /reports/:caseId`
- `POST /reports/:caseId/generate`
- `POST /reports/:caseId/sign`
- `POST /reports/:caseId/export`
- `GET /offline/sync-sessions`
- `PUT /offline/sync-sessions`
- `POST /offline/audit-events/batch`

Query filters and pagination:

- `GET /cases?page=1&pageSize=50&status=Intake&caseType=TOX`
- `GET /labs/orders?page=1&pageSize=50&labCode=LAB1&status=Created`
- `GET /labs/hl7/messages?page=1&pageSize=50&labCode=LAB1&direction=Inbound&messageType=ORU_R01&processingState=Received`
- `GET /labs/hl7/unmatched-results?page=1&pageSize=50&labCode=LAB1&status=Open`
- `GET /evidence?page=1&pageSize=50&caseId=<uuid>&barcode=BC-DEMO-001`
- `GET /media-assets?page=1&pageSize=50&caseId=<uuid>&mediaType=Photo`
- `GET /protocols/<caseId>/versions`
- `PUT /cremation-cases/<caseId>`
- `PUT /indigent-cases/<caseId>`
- `GET /reference/agencies?page=1&pageSize=50&agencyType=LEO`
- `GET /reference/case-types?page=1&pageSize=50&caseTypeCode=TOX`
- `GET /offline/sync-sessions?page=1&pageSize=50&syncState=Synced`
- `PUT /offline/sync-sessions` body: `{ "caseId": "<uuid>", "userId": "field-user-1", "deviceId": "device-1", "syncState": "Syncing" }`
- `POST /control/tenants/demo/labs/resolve` body: `{ "caseType": "TOX", "testType": "Alcohol", "priority": true }`
- `POST /control/offline-grants/enroll` body: `{ "tenantId": "demo", "userId": "field-user-1", "deviceId": "device-1", "ttlHours": 48, "scope": "FieldIntake" }`
- `GET /control/offline-grants/<grantId>/audit-events?tenantId=demo&eventType=offline_grant_validated&from=2026-03-16T09:30:00.000Z&to=2026-03-16T10:30:00.000Z&sort=eventAt:desc&page=1&pageSize=20`
- Optional cursor mode: `GET /control/offline-grants/<grantId>/audit-events?tenantId=demo&sort=eventAt:desc&pageSize=20&cursor=<nextCursor>`
- Invalid or stale non-empty cursor values return `400 Bad Request` with `code: "INVALID_CURSOR"`.
- `POST /reports/<caseId>/export` is blocked until protocol version status includes `Final` and the latest report is signed
- Structured error `code` values are centralized in the **API error codes** section below.
- Report operations (`list`, `generate`, `sign`, `export`) write tenant-scoped audit events with actor and request metadata
- Media operations (`view`, `download`) write tenant-scoped audit events with actor and request metadata
- HL7 unmatched-result operations (`queue view`, `match`, `reject`) write tenant-scoped audit events with actor and request metadata

Pagination defaults: `page=1`, `pageSize=50` (max `200`).

`POST /labs/orders` supports auto-routing when `labCode` is omitted. Provide optional `routingContext` (`testType`, `specimenType`, `caseType`, `agency`, `priority`) and the API selects an active tenant lab based on configured control-plane routing rules.

Protected routes now require `Authorization: Bearer <jwt>`.

Request validation is enabled globally (`ValidationPipe`) with transform + whitelist + forbidNonWhitelisted.

Auth modes:

- `AUTH_MODE=dev` (default): validates `HS256` tokens with `DEV_JWT_SECRET`, issuer `DEV_JWT_ISSUER`, audience `DEV_JWT_AUDIENCE`.
- `AUTH_MODE=okta`: validates Okta JWT with `OKTA_ISSUER`, `OKTA_AUDIENCE`, optional `OKTA_JWKS_URI`, and algorithms from `JWT_ALLOWED_ALGS`.

## API error codes

Structured API error responses include a machine-readable `code` field. Current codes:

- `INVALID_CURSOR` — malformed or stale non-empty cursor in offline-grant audit-event cursor mode
- `LAB_OVERRIDE_NOT_AVAILABLE` — requested override lab is not active or not found for tenant routing
- `REPORT_EXPORT_REPORT_NOT_SIGNED` — report export attempted before report signing
- `REPORT_EXPORT_PROTOCOL_NOT_FINAL` — report export attempted before protocol finalization
- `PROTOCOL_FINAL_IMMUTABLE_CREATE_NEW_VERSION` — attempted update of final protocol version; create a new version instead
- `PROTOCOL_FINAL_IMMUTABLE` — attempted status transition of final protocol version

Required claims for RBAC:

- `roles` (array) and/or `groups` (array)
- optional `tenant_id` (or `tid`) for tenant-scoped identity context

Device-token contract for `POST /control/offline-grants/validate`:

- `platform_admin` tokens may validate any grant.
- Non-admin device tokens must match all of the following request fields:
   - `tenant_id` (or `tid`) claim == request `tenantId`
   - `sub` claim == request `userId`
   - `device_id` claim (or `did`) == request `deviceId`
- If any value does not match, the API returns `403 Forbidden`.

`POST /control/offline-grants/ack-wipe` uses the same token-to-request matching rules as `validate`.

Example device-token payload (dev mode):

```json
{
   "sub": "field-user-1",
   "tenant_id": "demo",
   "roles": ["field_intake"],
   "device_id": "device-1"
}
```

Example validate request body:

```json
{
   "grantId": "<grant-id>",
   "tenantId": "demo",
   "userId": "field-user-1",
   "deviceId": "device-1"
}
```

The middleware resolves tenant context from host subdomain (`demo.localhost`, `countyx.localhost`) and scopes case/lab/hl7 data access to that tenant DB.

Quick local token mint example (dev mode):

```powershell
node -e "import('jose').then(async ({ SignJWT }) => { const secret = new TextEncoder().encode(process.env.DEV_JWT_SECRET ?? 'dev-local-secret-change-me'); const jwt = await new SignJWT({ roles: ['platform_admin'], tenant_id: 'demo' }).setProtectedHeader({ alg: 'HS256' }).setIssuer(process.env.DEV_JWT_ISSUER ?? 'emedex-dev').setAudience(process.env.DEV_JWT_AUDIENCE ?? 'emedex-api').setSubject('local-admin').setExpirationTime('2h').sign(secret); console.log(jwt); })"
```

Quick field device token mint example (dev mode):

```powershell
node -e "import('jose').then(async ({ SignJWT }) => { const secret = new TextEncoder().encode(process.env.DEV_JWT_SECRET ?? 'dev-local-secret-change-me'); const jwt = await new SignJWT({ roles: ['field_intake'], tenant_id: 'demo', device_id: 'device-1' }).setProtectedHeader({ alg: 'HS256' }).setIssuer(process.env.DEV_JWT_ISSUER ?? 'emedex-dev').setAudience(process.env.DEV_JWT_AUDIENCE ?? 'emedex-api').setSubject('field-user-1').setExpirationTime('2h').sign(secret); console.log(jwt); })"
```

Quick offline-grant validation flow (PowerShell):

1. Mint admin token and device token; copy each JWT output.
2. Enroll a grant using admin token:

```powershell
curl -Method Post http://localhost:3000/control/offline-grants/enroll `
   -Headers @{ Authorization = "Bearer <ADMIN_JWT>"; "Content-Type" = "application/json" } `
   -Body '{"tenantId": "demo", "userId": "field-user-1", "deviceId": "device-1", "ttlHours": 48, "scope": "FieldIntake"}'
```

3. Copy `grantId` from the enroll response and validate with device token:

```powershell
curl -Method Post http://localhost:3000/control/offline-grants/validate `
   -Headers @{ Authorization = "Bearer <DEVICE_JWT>"; "Content-Type" = "application/json" } `
   -Body '{"grantId": "<GRANT_ID>", "tenantId": "demo", "userId": "field-user-1", "deviceId": "device-1"}'
```

4. Negative test (mismatched device id; should be forbidden):

```powershell
curl -Method Post http://localhost:3000/control/offline-grants/validate `
   -Headers @{ Authorization = "Bearer <DEVICE_JWT>"; "Content-Type" = "application/json" } `
   -Body '{"grantId": "<GRANT_ID>", "tenantId": "demo", "userId": "field-user-1", "deviceId": "device-wrong"}'
```

5. Negative test (mismatched tenant id; should be forbidden):

```powershell
curl -Method Post http://localhost:3000/control/offline-grants/validate `
   -Headers @{ Authorization = "Bearer <DEVICE_JWT>"; "Content-Type" = "application/json" } `
   -Body '{"grantId": "<GRANT_ID>", "tenantId": "other-tenant", "userId": "field-user-1", "deviceId": "device-1"}'
```

6. Negative test (mismatched user id / subject; should be forbidden):

```powershell
curl -Method Post http://localhost:3000/control/offline-grants/validate `
   -Headers @{ Authorization = "Bearer <DEVICE_JWT>"; "Content-Type" = "application/json" } `
   -Body '{"grantId": "<GRANT_ID>", "tenantId": "demo", "userId": "other-user", "deviceId": "device-1"}'
```

7. Acknowledge wipe completion after client wipe succeeds:

```powershell
curl -Method Post http://localhost:3000/control/offline-grants/ack-wipe `
   -Headers @{ Authorization = "Bearer <DEVICE_JWT>"; "Content-Type" = "application/json" } `
   -Body '{"grantId": "<GRANT_ID>", "tenantId": "demo", "userId": "field-user-1", "deviceId": "device-1"}'
```

Expected results:

- Success (`201`) with `{"valid": true, "reason": "OK", ...}` when claims and body match.
- Forbidden (`403`) when device token `tenant_id`/`sub`/`device_id` does not match request body (for example the negative tests above).
- Wipe acknowledgment success (`201`) with `{"acknowledged": true, "reason": "OK", ...}` clears `wipeRequired` for revoked grants.
- `POST /control/offline-grants/ack-wipe` reason codes:
  - `OK`: wipe acknowledgment accepted for a revoked grant and `wipeRequired` cleared.
  - `NOT_FOUND`: no grant matched the provided `grantId` + `tenantId` + `userId` + `deviceId`.
  - `NOT_REVOKED`: grant exists but current status is not `revoked`.
- Successful offline-grant lifecycle operations write tenant-scoped audit events with actor, roles, device, and request metadata:
  - `POST /control/offline-grants/enroll` → `offline_grant_enrolled`
  - `POST /control/offline-grants/validate` → `offline_grant_validated`
  - `POST /control/offline-grants/revoke` → `offline_grant_revoked`
  - `POST /control/offline-grants/ack-wipe` → `offline_grant_wipe_acknowledged`

Example create payload:

```json
{
   "tenantId": "county-a",
   "subdomain": "countya",
   "timezone": "America/New_York",
   "locale": "en-US",
   "status": "active",
   "tenantDbName": "emedex_countya"
}
```

## TypeORM migration scaffold

- `pnpm --filter @emedex/api typeorm:control:migrate`
- `pnpm --filter @emedex/api typeorm:tenant:migrate`

Migration files live in `apps/api/src/persistence/migrations`.

Functional core migration now includes:

- canonical numbering sequence table + function: `assign_canonical_case_number(tenant, prefix, year)`
- functional domain tables: investigations, police_holds, evidence_items, custody_events, media_assets, protocol_versions, cremation_cases, indigent_cases, and core reference catalogs

## Repo health

- `pnpm lint`
- `pnpm test`
- `pnpm audit --audit-level=high`

Pinned versions are tracked in [docs/versions.md](docs/versions.md).
