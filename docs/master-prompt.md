## Functional Requirements (Critical) — What We Are Building

This section defines the **end-user features and workflows** that E‑MedEx‑Next must implement (tenant-scoped).

### 1) Core Concepts & Entities (must)
**Case** is the central entity. Each Case has:
- `client_case_uuid` (UUID, immutable)
- `canonical_case_number` (server-issued; no skipped numbers)
- `temporary_case_number` (offline alias; searchable forever)
- `case_type` (tenant-configurable; defaults include BME, NME, TOX, CRE, DON, BUR, IND)
- status lifecycle (tenant-configurable but must support: Intake → In Progress → Review → Finalized/Locked)
- flags: Police Hold, Priority, Coroner/ME jurisdiction, etc.
- audit trail of all changes and sensitive reads

**Other core entities (must)**
- Decedent demographics (or equivalent subject record)
- Agency (police, hospital, funeral home), People/Contacts
- Notes (typed, time-stamped, authored)
- Media assets (photos/docs) + attachments to cases/modules
- Evidence items + append-only chain-of-custody events
- Specimens/Samples (collected/received/sent to lab)
- Lab Orders/Results (HL7-integrated)
- Protocol versions (autopsy/protocol authoring, versioning, finalization)

---

## 2) Tenant Admin / SaaS Ops (must)
### 2.1 Tenant provisioning (must)
- Create tenant (county/client) with:
  - subdomain, timezone, locale
  - case numbering configuration (prefix/format)
  - default case types and workflows
- Initialize tenant DB (migrations + seed)
- Enable/disable tenant
- Export/backup/restore tenant data

### 2.2 User, roles, permissions (must)
- Manage roles/permissions per tenant:
  - module access, action access (create/edit/delete/finalize/print/export)
  - field-level restrictions for sensitive fields
- Police Hold policy configuration:
  - who can view/edit
  - mandatory additional audit logging

### 2.3 Device management (must)
- Enrolled offline devices list
- Revoke device → remote wipe on next online contact
- Sync monitoring dashboard:
  - devices, last sync time, sync failures, exceptions

---

## 3) Case Creation & Intake (Online + Offline) (must)

### 3.1 Online case creation (web) (must)
- Create case with required fields (tenant-configurable)
- Duplicate detection suggestions (name/DOB/date/location)
- Assign investigator/owner
- Case timeline view (events + custody + lab + notes)

### 3.2 Offline field intake (mobile + desktop) (must)
Offline mode supports **field intake only**:
- create new intake case locally
- capture demographics + incident/death basics
- capture notes/narrative
- capture evidence/specimen intake + “received” custody events
- capture and store **all photos** locally (encrypted)

Offline login:
- biometric and/or PIN unlock (after prior online enrollment)
- offline TTL enforcement

Sync:
- upload case + media + audit log
- server assigns canonical case number
- conflict handling: if server progressed beyond intake → create sync exception for supervisor

---

## 4) Investigation Module (must)
### 4.1 Investigator workflow (must)
- Investigator can:
  - update scene/incident details
  - enter investigation narrative notes (time-stamped)
  - add contacts (LEO, NOK, witnesses)
  - record disposition requests (transport, release, hold)
- Ownership rules:
  - assigned investigator edits; others view-only unless granted permission
  - narrative edit restrictions configurable

### 4.2 Duplicate/related cases (must)
- Link related cases (same incident, same decedent, etc.)
- Prevent accidental duplicates with warnings and merge workflow (admin-only)

---

## 5) Evidence & Chain-of-Custody (must)
### 5.1 Evidence items (must)
- Create evidence items:
  - item type, description, seal, container, storage requirements
  - barcode label generation
- Evidence must be attachable to case and optionally to lab orders.

### 5.2 Custody events (append-only) (must)
- Record custody events: received, transferred, stored, released, disposed
- Each event includes:
  - timestamp, actor, location, from/to, reason
- Barcode scan flow (fast):
  - scan → lookup → record custody update within 250ms p95 end-to-end

---

## 6) Specimen / Sample Management (must)
- Record specimen collection/receipt
- Link specimens to:
  - case
  - evidence item (optional)
  - lab order(s)
- Support specimen lifecycle:
  - collected → received → sent to lab → results received → retained/disposed (policy)

---

## 7) Lab / Toxicology Module + HL7 Integration (must)

### 7.1 Lab registration and routing (multi-lab per tenant) (must)
- Tenant can configure multiple labs (HL7 endpoints)
- Routing rules determine default lab per order (test/specimen/case/priority)
- Manual override requires permission and is audited

### 7.2 Lab ordering (must)
- Create lab order:
  - one or more specimens
  - requested tests/panels
  - priority, notes
- On “send order”:
  - generate HL7 ORM^O01
  - transmit via MLLP
  - record message logs and status (Sent/Ack/Failed/Retried)

### 7.3 Result ingestion (must)
- Receive HL7 ORU^R01 via MLLP gateway
- Parse and map results into structured schema:
  - analyte/value/unit/range/flags/performed time/instrument/lab
- Results appear in UI within 30 seconds
- Handle:
  - partial results
  - final results
  - corrected results

### 7.4 Review & finalization (must)
- Lab results require review/approval workflow before finalization
- Restrict printing/export until finalized (policy-driven)
- Maintain full audit trail of approvals and corrections

### 7.5 Reconciliation (must)
- Unmatched result queue:
  - results with unknown placer/filler IDs or missing linkage
  - authorized users can match to case/order/specimen or reject
- Idempotency:
  - prevent duplicate processing of repeated HL7 messages

---

## 8) Pathology / Autopsy / Protocol Authoring (must)
- Protocol authoring:
  - rich text editor
  - versioning (draft → review → final)
  - final versions immutable (new version required for changes)
- Cause/Manner workflow:
  - structured fields + narrative
- Attachments:
  - diagrams, photos, scanned forms
- Signatures:
  - captured electronically; includes date/time and signer identity

---

## 9) Media (Photos/Docs) (must)
- Upload/capture photos and documents
- Store in object storage; metadata in Postgres
- Thumbnail generation
- Viewer with permission checks
- Audit all media views/downloads

Offline:
- must support local photo capture and later sync

---

## 10) Cremation + Indigent (must)
### 10.1 Cremation (must)
- Approval workflow
- Funeral home directory and case linking
- Duplicate detection checks

### 10.2 Indigent (must)
- Referral tracking
- NOK/disposition notes
- Auto-fill from investigation where applicable

---

## 11) Search & Reporting (must)
- Simple search:
  - case number, temporary number alias, decedent name
- Advanced search:
  - date ranges, case type, status, police hold, assigned investigator, lab status, evidence status
- Reporting:
  - standard reports (tenant-specific templates)
  - asynchronous generation with job status
- All report access and exports audited

---

## 12) Audit & Compliance (must)
- Audit events for:
  - all CRUD changes
  - sensitive reads (Police Hold, media view/download, report view/export)
- Audit must include:
  - tenantId, actor, roles, deviceId, IP (when available), timestamps, before/after diffs

---
