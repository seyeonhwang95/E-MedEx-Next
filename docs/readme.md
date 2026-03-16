# E‑MedEx‑Next — Unified Requirements (Functional + Technical)

**Repository:** `seyeonhwang95/E-MedEx-Next`  
**Last updated:** 2026-03-16

This file is the **single source of truth** for what E‑MedEx‑Next must do (functional requirements) and how it must be built (technical/non‑functional requirements).  
Scope covers: multi‑tenant SaaS, offline field intake, HL7 lab integration, performance SLOs, local dev/testing, and shared design system (web + React Native).

---

## 0) Product Objective

Build **E‑MedEx Next**, a modern Medical Examiner / Toxicology / Evidence case management platform with:

1) **Fast processing** as the #1 success metric (measured SLOs + CI performance gates)  
2) **Offline-first field intake** on **mobile + desktop** with encrypted local storage for cases and **all photos**, temp case numbers, and automatic sync  
3) Authentication with **Okta (OIDC/OAuth2)** and strong authorization + auditing  
4) **Lab integration** using industry standard **HL7 v2.x** (ORM^O01 / ORU^R01) over **MLLP**  
5) **Multi-county / worldwide** multi‑tenant SaaS: **database-per-tenant** + **subdomain-per-tenant** routing  
6) Ability to register **multiple labs per tenant** and route orders/results correctly  
7) Local development and testing via **Docker Compose** (services) and host-run web dev server (Option B)  
8) Shared design system via packages:
   - `@emedex/theme` shared across web + React Native
   - `@emedex/ui-web` (shadcn/ui + Tailwind v4) for web
   - `@emedex/ui-native` for React Native consuming shared tokens

---

# PART A — Technical / Non‑Functional Requirements

## A1) Required Technology Stack

### Identity & Access
- **Okta** as IdP (OIDC/OAuth2)
- Authorization Code + PKCE for SPA/mobile/desktop
- Okta Groups → App Roles mapping (tenant-scoped)
- MFA controlled by Okta policies

### Web (Online system)
- **React + TypeScript**
- **Tailwind CSS v4 (latest)**
- UI components from `@emedex/ui-web`
- Data fetching/caching: React Query (or equivalent)
- RBAC-aware routing + menu rendering

### Backend
- **NestJS + TypeScript**
- REST APIs (required)
- Background jobs: **BullMQ + Redis**
- Observability: OpenTelemetry (tracing + metrics + logs correlation)

### Data
- **PostgreSQL** system of record
- **TypeORM** + migrations
- JSONB allowed for configurable fields
- Object storage (S3-compatible: AWS S3 / MinIO) for photos/docs

### Search
- **OpenSearch/Elasticsearch** for full-text and faceted search

### Offline Apps (Field Intake)
- **Mobile:** React Native + TypeScript
- **Desktop:** Electron + TypeScript
- Encrypted local DB (SQLite + SQLCipher or equivalent) + encrypted local media store

### HL7 Integration
- HL7 v2.x:
  - Orders: **ORM^O01**
  - Results: **ORU^R01**
- Transport: **MLLP over TCP** (required minimum)

---

## A2) Multi‑Tenant SaaS (Most Important)

### Tenant model (must)
- One deployed platform supports many tenants (“counties/clients”).
- Each tenant has:
  - tenant-scoped users/roles/permissions
  - tenant configuration (case types, numbering, templates, retention rules)
  - tenant lab integrations (multiple labs)
  - strict data isolation boundary

### Isolation strategy (required): Database-per-tenant
- Each tenant has its own Postgres database (separate connection string).
- Tenant-scoped:
  - OpenSearch index namespace/prefix
  - object storage prefix/bucket partitioning: `s3://<bucket>/<tenantId>/...`
- Per-tenant backup/restore/export must be possible.
- Cross-tenant access must be impossible by default; include automated tests validating isolation.

### Tenant routing (required): Subdomain-per-tenant
- Requests identify tenant from host:
  - `https://<tenant>.emedex.com`
- Tenant resolution occurs at request start and scopes:
  - DB connection
  - search index
  - object storage prefix
  - audit context

### Control Plane vs Data Plane (must)
- **Control Plane DB (shared)** stores only tenant registry + routing + non-PHI metadata:
  - tenantId, subdomain, timezone, locale, status
  - DB connection secret references
  - auth config references (Okta)
  - lab endpoint registrations metadata (no PHI)
- **Tenant Data Plane DB** stores PHI/case data and is isolated per tenant.

---

## A3) Security & Compliance (must)
- No Okta passwords stored locally.
- Encrypt PHI at rest:
  - tenant DB encryption strategy (platform-dependent)
  - local device encryption for offline stores (required)
- Field-level security: hide/redact sensitive fields by role/policy.
- Police Hold:
  - strict access policy
  - enhanced audit logging
- Audit sensitive reads:
  - media views/downloads, police hold access, report generation/view/export.

---

## A4) Performance Requirements (Fast Processing)

### SLOs (p95) — must be tested, not assumed
**Interactive**
- Open case workspace: API p95 < 500 ms
- Navigate modules: API p95 < 400 ms
- Save typical update: API p95 < 300 ms
- Barcode scan custody event: end-to-end p95 < 250 ms

**Search**
- Simple search: p95 < 300 ms
- Advanced faceted search: p95 < 800 ms

**Media**
- First 50 thumbnails: p95 < 1.5 s
- Media metadata + signed URL: p95 < 1.0 s (excluding bandwidth)

**Background**
- HL7 message processed + visible: < 30 s
- DB→Search indexing lag: < 60 s

### Performance gates (must)
- Add load tests (k6 or equivalent) for:
  - open case, navigation, save
  - barcode scan loop
  - search queries
  - HL7 burst ingestion
- CI fails if p95 regresses beyond defined budget (e.g., >10%).

---

## A5) Offline‑First Architecture Requirements

### Offline scope (required): Field intake only
Offline apps support:
- create intake case
- demographics + incident/death basics
- intake notes/narrative
- evidence/specimen intake + custody “received”
- capture and store **all photos** locally (encrypted)
Other workflows can be disabled offline.

### Offline identifiers (required)
- Offline creates:
  - `client_case_uuid` (UUID)
  - **LTCN**: `TMP-<TENANTCODE>-<SITE>-<YYYYMMDD>-<DEVICE>-<SEQ>`
- Server assigns:
  - **CSCN**: `<PREFIX><YYYY>-<SEQUENCE>`
  - must enforce **no skipped canonical numbers**
- LTCN remains searchable alias forever.

### Sync protocol (required)
- Automatic + manual sync
- Batch push + pull (cursor-based)
- chunked/resumable media upload
- idempotency keys
- per-case sync states: `LocalOnly → Queued → Syncing → Synced / Error`

### Conflicts (required)
- If server case is locked/advanced beyond intake: do not overwrite.
- Create sync exception requiring supervisor reconciliation; audit resolution.

---

## A6) Offline Login (No Internet) — Both Biometric + PIN

### Enrollment (online only, required)
- First use requires online Okta login.
- Device enrollment issues offline grant bound to:
  - `tenant_id`, `user_id`, `device_id`, scope=FieldIntake, TTL
- Store keypair/keys in OS secure keystore.

### Offline unlock (required)
- Support BOTH:
  - biometric unlock and/or
  - local app PIN (>=6 digits) with attempt limits + lockout
- Offline TTL default 24–72 hours (configurable).
- TTL exceeded → must re-auth online.

### Revocation + remote wipe (required)
- Admin can revoke device; on next online contact app wipes encrypted local data.

### Offline audit (required)
- Append-only local audit log uploaded during sync.

---

## A7) HL7 Integration (Multi‑Lab per Tenant)

### Multi-lab (required)
- Tenant can register multiple labs with:
  - MLLP endpoints, HL7 identifiers, mapping tables, retry policies
  - active/inactive status + config versioning

### Routing rules (required)
- Lab selection based on:
  - test type, specimen type, case type, priority, agency (tenant configurable)
- Manual override requires permission and is audited.

### Gateway responsibilities (required)
- MLLP listener/client
- HL7 parse/validate/map
- ACK handling
- message logs persisted (tenant + lab scoped)
- idempotency by message control ID + hash
- results visible in UI within 30 seconds

### Reconciliation (required)
- Unmatched Result queue per tenant and lab
- tools to match/link/reject
- prevent cross-tenant attachment of results

---

## A8) Design System (Web + React Native)

### Packages (must)
- `@emedex/theme` — shared tokens + theming logic (web + RN)
- `@emedex/ui-web` — web-only, shadcn/ui components, Tailwind v4
- `@emedex/ui-native` — RN-only component set styled from `@emedex/theme`

### shadcn requirement (web) (must)
- Vendor/copy all components from https://ui.shadcn.com/docs/components into `@emedex/ui-web`
- Provide barrel exports for consistent imports
- Theming via CSS variables generated from `@emedex/theme`

### RN requirement (must)
- Implement RN equivalents for core components (Button, Input, Card, Modal/Sheet, Toast, etc.)
- Do not import Radix/shadcn into RN

### No MFEs for v1 (must)
- Use a modular monolith SPA with route-level code splitting.
- Consider MFEs only later when multiple teams need independent deployments.

---

## A9) Local Development & Testing (Docker Compose) — Must

### One-command services (must)
Repo includes `docker-compose.yml` to start:
- control-plane Postgres
- demo tenant Postgres
- Redis
- OpenSearch (+ Dashboards optional)
- MinIO (+ bucket init)
- HL7 gateway (recommended)
- API (optional; can run on host)

### Tenant subdomain local routing (must)
Document hosts setup:
- `demo.localhost`
- `api.demo.localhost`

### Local auth mode (must)
Local dev must not require a real Okta tenant:
- Provide dev JWT issuer or mock auth mode (dev-only)
- Document minting tokens with tenant + role claims

### HL7 test harness (must)
- `samples/hl7/` includes ORM and ORU examples
- `scripts/send-hl7.sh` sends sample messages to local gateway

---

# PART B — Functional Requirements (Critical)

## B1) Core Concepts & Entities (must)
**Case** is the central entity:
- `client_case_uuid` (immutable UUID)
- `canonical_case_number` (server-issued; no skipped numbers)
- `temporary_case_number` (offline alias; searchable forever)
- `case_type` (tenant-configurable; defaults: BME, NME, TOX, CRE, DON, BUR, IND)
- status lifecycle (must support: Intake → In Progress → Review → Finalized/Locked)
- flags: Police Hold, Priority, etc.
- complete audit trail

Other core entities (must):
- Decedent demographics / subject record
- Agencies, People/Contacts
- Notes (typed, authored, time-stamped)
- Media assets (photos/docs) + attachments
- Evidence items + custody events (append-only)
- Specimens/Samples
- Lab Orders + Lab Results (HL7-integrated)
- Protocol versions (draft/review/final)

---

## B2) Tenant Admin / SaaS Ops (must)
### Tenant provisioning
- Create tenant (county/client) with subdomain, timezone, locale, numbering config
- Initialize tenant DB schema + seed reference catalogs
- Suspend/disable tenant
- Export/backup/restore tenant data

### User/Role/Permission management
- Manage tenant roles and permissions:
  - module access + action access
  - field-level security
- Police Hold policies configurable

### Device management
- View enrolled devices, last sync, failures/exceptions
- Revoke devices (remote wipe on next online contact)

### Lab management (multi-lab)
- Register labs, edit mappings, activate/deactivate, view message dashboards
- Manage lab routing rules

---

## B3) Case Creation & Intake (Online + Offline) (must)
### Online case creation (web)
- Create case with tenant-required fields
- Duplicate detection suggestions
- Assign owner/investigator
- Case timeline/workspace view

### Offline field intake (mobile + desktop)
- Create intake case locally (UUID + LTCN)
- Capture demographics + incident/death basics
- Capture notes/narrative
- Capture evidence/specimen intake + custody “received”
- Capture photos (encrypted local storage)

### Sync
- Push local cases/media/audit to server
- Server assigns CSCN; LTCN remains alias
- Conflicts generate supervisor reconciliation tasks

---

## B4) Investigation Module (must)
- Update incident/death details and scene information
- Record narrative notes and structured fields
- Add contacts (LEO, NOK, hospital, witnesses)
- Disposition requests (transport/release/hold)
- Ownership rules and configurable narrative restrictions
- Link related cases; admin-only merge workflow (optional v1)

---

## B5) Evidence & Chain-of-Custody (must)
### Evidence items
- Create evidence items, attach to cases
- Barcode label generation

### Custody events (append-only)
- Record custody: received/transferred/stored/released/disposed
- Each event includes actor/time/location/from/to/reason
- Barcode scan workflow optimized for speed

---

## B6) Specimen / Sample Management (must)
- Record specimen lifecycle: collected → received → sent → resulted → retained/disposed
- Link specimens to cases and optionally evidence items
- Support barcode labeling

---

## B7) Lab / Toxicology Module + HL7 (must)
### Lab ordering
- Create lab orders tied to case and specimen(s)
- Send HL7 ORM^O01 via configured lab route
- Track order lifecycle states: Created → Sent → Ack → InProgress → Partial → Final → Verified/Finalized

### Result ingestion
- Receive HL7 ORU^R01
- Parse/map/store structured results with units, flags, times, instrument, lab
- Results visible within 30 seconds

### Review & finalization
- Results require review/approval before finalization
- Printing/export restrictions until finalized (policy-driven)

### Reconciliation
- Unmatched results queue per tenant/lab with tools to link/reject
- Idempotent processing of duplicate messages

---

## B8) Pathology / Autopsy / Protocol Authoring (must)
- Protocol authoring with rich text editor
- Versioning: draft → review → final
- Final protocol immutable; changes require new version
- Cause/manner workflow (structured + narrative)
- Attachments (diagrams/photos/scanned docs)
- Signatures (identity + timestamp)

---

## B9) Media (Photos/Docs) (must)
- Upload/store photos/docs in object storage with metadata in Postgres
- Thumbnail generation and gallery view
- Secure viewer with permissions
- Audit all media views/downloads
- Offline capture and later sync supported

---

## B10) Cremation + Indigent (must)
### Cremation
- Approval workflow
- Funeral home directory
- Duplicate detection checks

### Indigent
- Referral tracking
- NOK/disposition notes
- Auto-fill from investigation when linked

---

## B11) Search & Reporting (must)
- Simple search: canonical #, temporary alias, name
- Advanced search: filters by date, type, status, police hold, investigator, lab status, evidence status
- Reports:
  - standard reports + tenant-specific templates
  - async generation with status/progress
- Audit report generation/view/export

---

## B12) Audit & Compliance (must)
- Audit all CRUD and sensitive reads
- Include tenantId, actor, roles, deviceId, IP (when available), timestamps, before/after diffs
- Upload offline audit events during sync

---

## Deliverables Checklist
- Web app (React + Tailwind v4 + `@emedex/ui-web`)
- API (NestJS) + TypeORM migrations
- Control plane + tenant provisioning tooling
- Offline mobile (React Native) intake app
- Offline desktop (Electron) intake app
- HL7 gateway (MLLP) + dashboards + reconciliation
- OpenSearch indexing
- Docker Compose local environment + HL7 sample test harness
- Load tests + CI performance gates
- Admin consoles (tenant, roles, devices, labs, audit)

---

## Requirement: Latest Stable/LTS Tech + Security-First Dependencies (Must)

**Goal:** Prevent security risk from outdated tooling by enforcing **latest stable/LTS** versions and continuous updates with CI gates.

### 1) Version policy (must)
Use **latest stable/LTS** (not bleeding-edge prerelease) across the monorepo:

- **Node.js:** current **LTS** only  
  - enforce with `.nvmrc` and `package.json#engines.node`
- **pnpm:** latest stable (pin minimum version in `package.json#engines.pnpm`)
- **TypeScript:** latest stable
- **React (web):** latest stable major
- **React Native (mobile):** latest stable major compatible with chosen workflow (Expo or bare)
- **NestJS:** latest stable
- **PostgreSQL / Redis / OpenSearch / MinIO:** latest stable major versions used in Docker Compose and production

Maintain a `docs/versions.md` (or top-of-README table) that lists the pinned major versions and upgrade cadence.

### 2) Dependency governance (must)
- Use **pnpm workspaces** for the entire repo.
- Commit the lockfile (`pnpm-lock.yaml`).
- Enforce workspace alignment (no multiple React versions).
- Prefer well-maintained libraries with active security support.

### 3) Automated updates (must)
Enable **Renovate or Dependabot**:
- schedule: weekly
- auto-merge: patch/minor updates when CI passes
- manual review: major updates
- must open PRs for Docker image updates (Postgres/Redis/OpenSearch/MinIO) as well.

### 4) Security scanning + CI gates (must)
CI must include:
- Dependency vulnerability scanning:
  - `pnpm audit` (or equivalent) and fail build on **high/critical**
  - allow temporary exceptions only via an allowlist with an **expiry date** documented
- SAST:
  - CodeQL for TypeScript/JavaScript (minimum)
- Secret scanning:
  - never commit `.env`, private keys, tokens; require `.gitignore` and pre-commit checks
- Container image scanning (recommended):
  - Trivy scan for built images and docker compose images

### 5) Cryptography and auth safety (must)
- Offline encryption:
  - use modern authenticated encryption (AES-GCM or platform equivalents)
  - PIN-based unlock uses a strong KDF (Argon2id preferred; otherwise scrypt)
- JWT validation must enforce:
  - issuer + audience validation
  - algorithm allowlist (no `none`)
  - strict expiration and limited clock skew
- Enforce TLS for all non-local traffic.
- HL7 MLLP networking must be deployed behind secure network controls (VPN/mTLS/allowlist) per lab requirements.

### 6) “No EOL at release” gate (must)
- No runtime/framework versions that are **EOL** at the time of release.
- Quarterly maintenance requirement:
  - upgrade major versions as needed (planned window)
  - rotate secrets/keys
  - validate backup + restore per tenant

### 7) Developer experience enforcement (must)
- CI must fail if:
  - Node version differs from `.nvmrc`/`engines`
  - pnpm version below minimum
- Provide a single command to validate repo health:
  - `pnpm -r lint && pnpm -r test` (or equivalent)
