# Legacy-to-Modern Modernization Map

This scaffold keeps the legacy artifacts for reference while moving the implementation to a multi-tenant architecture.

## Key legacy findings

- The legacy SQL Anywhere schema in [docs/medextables.sql](docs/medextables.sql) is case-number centric and largely flat.
- Broward-era requirements in [docs/MEDEX RLI.txt](docs/MEDEX%20RLI.txt) assume one-county deployment and browser-era constraints.
- Many reference tables remain useful as tenant seed catalogs.

## Recommended migration mapping

| Legacy table group | Modern bounded context |
| --- | --- |
| `INVESTIGATION`, `INVESTIGATION2`, `CLOSED_CASE`, `INV_REVIEW` | `cases`, `investigations`, `case_status_history` |
| `PATHOLOGY`, `PROTOCOL`, `FORENSIC`, `HISTOLOGY` | `protocol_versions`, `pathology_cases`, `autopsy_artifacts` |
| `LAB_CONTROL`, `LAB_RECEIVING`, `TEST_ASSIGNMENT`, `TEST_RESULT`, `LAB_REVIEW`, `LAB_NOTE` | `lab_orders`, `lab_order_items`, `lab_results`, `hl7_messages`, `reconciliation_queue` |
| `PHOTOGRAPHY`, `PHOTO`, `DIRECTORY_TABLE` | `media_assets`, `media_collections`, `object_storage_references` |
| `EVIDENCE_CUSTODY`, `TOX_SAMPLES`, `SAMPLE`, `SPECIMEN` | `evidence_items`, `custody_events`, `specimens` |
| `CREMATION`, `INDIGENT` | `cremation_cases`, `indigent_cases` |
| Lookup tables such as `RACE`, `COUNTY`, `STATE`, `CASE_TYPE`, `TEST` | tenant-configurable reference catalogs |

## Migration principles

1. Preserve legacy case numbers as searchable aliases.
2. Re-issue canonical numbers from the new server-side numbering service.
3. Split control-plane metadata from tenant PHI data.
4. Replace table-level assumptions with audited domain events.
5. Move lab integrations from direct tables to HL7 message workflows.