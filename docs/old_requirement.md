1) Procurement / proposal constraints (from RFP + Addendum #4)
1.	Acceptance testing approach provided: Exhibit 5 testing techniques are informational; vendor should note exceptions if any technique won’t work for their solution.
2.	Authentication must be “pass-through” using Active Directory (AD):
o	Broward County uses AD as central authentication.
o	County provides an internal .NET Web Service for pass-through auth (username/password → success/failure + pertinent info).
o	This web service is the preferred method and will be made available to the selected vendor.
3.	Configurable security by group:
o	Define groups; members get access to specific screens/functions.
4.	Highly configurable with minimal customization:
o	“Configurable” = customer can modify without vendor custom code per implementation.
5.	Browser-based system required:
o	Must follow industry standards and Broward County OIT standards (Exhibit 3 OIT Standards).
6.	Database choice:
o	Vendor should pick one of Oracle or SQL Server as their best solution; proposal should be based on that (not two parallel proposals).
________________________________________
2) Project overview / goals / context requirements (SOW)
1.	Replace/improve an existing PowerBuilder 6.5 + SQL Anywhere system (implemented 1999).
2.	Must support core areas/functions:
o	Investigations, Forensic, Pathology, Photography, Laboratory, Cremation, Indigent Burials.
3.	Goal: “state of the art browser based solution” that improves productivity and supports:
o	Better integration, role-based security, electronic data exchange, future adaptability.
4.	Volume and user expectations:
o	Internal users ~30–40, external users ~20–30.
o	Approx annual volumes: ~1800 BME, 1800 NME, 800 TOX, 6000 CRE, 500 IND, ~11000 pictures.
o	Must handle major disaster scenarios (lots of body parts/bodies/bones).
5.	Must provide services (vendor obligations):
o	Project management, consulting, programming, interface development, configuration, data conversion, maintenance support.
o	Potential escrow/source-code deposit required (explicitly stated in requirements too).
________________________________________
3) Standards / platform constraints (OIT Standards + SOW “standards”)
1.	Must be supportable in County’s (historic) standards environment, including:
o	Windows Server / IIS; AD auth; Exchange/Outlook; IE6+ (per text).
2.	Development tech allowed/expected:
o	Microsoft .NET or Java (and VB6 is referenced only as an option with migration plan in “like to have”).
3.	Web/internet standards:
o	HTML/Java/Web Services; JavaScript; IE 6 or greater (per SYS requirements).
________________________________________
4) Core solution capabilities (high-level “must” from SOW Section B)
The solution must be able to:
1.	Track all data modifications/updates/authoring (auditability).
2.	Provide advanced search and creative queries.
3.	Generate standard and ad-hoc reports.
4.	Handle “Police Hold” cases.
5.	Store photos outside the database using formats JPG/PNG/TIFF/RAW.
6.	Use bar-coding or RFID to track samples/evidence.
7.	Track chain of custody for specimens including body.
8.	Introduce electronic workflow/process improvements.
9.	Provide read-only access for external agencies/counties, etc.
10.	Rich text notes/comments/emails (bold/underline etc.).
11.	Spell check with medical + toxicology dictionary; provide detailed data dictionary.
12.	Follow existing case numbering scheme; no skipped case numbers.
13.	Automated instrument interfaces (no manual intervention).
14.	Email + scanning/storing docs + printing death certificates.
15.	Provide user handbook and online help.
16.	Provide training to technical and non-technical staff.
17.	Convert prior-year data into the new system.
________________________________________
5) Functional & Technical Requirements — Exhibit 2 (MUST be part of final solution)
5.1 General / System-wide (ALL)
•	ALL-M0: Web-based solution; indicate if using .NET, Java, or VB6.
•	ALL-M1: Help Desk support available 6:00 AM–5:00 PM ET.
•	ALL-M2: On-site technical support during implementation.
•	ALL-M3: HIPAA compliant and configurable for privacy requirements.
•	ALL-M4: Send emails via Outlook; show notifications; emails stored in DB.
•	ALL-M5: Store scanned documents (property sheet, death certificate, body diagrams, etc.).
•	ALL-M6: Intranet app for internal authorized users; internet component for authorized external-agency users.
•	ALL-M7: Browser-based internet read-only module for external agencies to access case info/reports relevant to their duties.
•	ALL-M8: Case-driven UI: selecting a case gives access to Investigation/Pathology/Forensic/etc (possibly via links).
•	ALL-M9: Case locking after review; only Admin + finalizing user can change; audit track required.
•	ALL-M10: Track multiple statuses (test status, lab case status, overall case status) and support specimen/evidence tracking for:
o	Investigations (evidence/medications)
o	Forensics (autopsy specimens)
o	Laboratory (toxicology specimens)
o	External lab send-outs + additional labels
o	Pathology histology slides/blocks tracking
o	Pathology physical evidence collected during autopsy
•	ALL-M11: Option to view/update ME or TOX cases after successful login.
•	ALL-M12: Handle major disaster scenario (large number of body parts/bodies/bones).
5.2 Data Conversion (CON)
•	CON-M1: Convert old data from 1999 and make accessible in new system.
5.3 Cremation module (CRE)
•	CRE-M1: Update/track cremation approval info.
•	CRE-M2: Duplicate detection on entry (same first/last/middle); user can accept/delete.
•	CRE-M3: Generate cremation/burial case numbers with prefixes:
o	CRE (fee unless indigent),
o	DON (donation, no fee),
o	BUR (burial at sea, no fee).
•	CRE-M4: After approval, fax cremation approval to funeral home; maintain Funeral Home table (name, 3-line address min, contact, phone, fax, provider number, etc.).
•	CRE-M5: Browse screen shows sortable case number (CRE/BUR/DON), decedent, funeral home, approved date, indigent, etc.
•	CRE-M6: Approvals screen tracks case numbers/type, approved date/time, approved by, decedent name, funeral home, indigent status, fee.
5.4 Forensic/Histology (FRH)
•	FRH-M1: Print labels for specimens/evidence via barcoding.
•	FRH-M2: Track evidence sent out for processing; expected returns vs actual received.
•	FRH-M3: Chain-of-custody tracking for all evidence.
5.5 Indigent Burials module (IND)
•	IND-M1: Maintain indigent burial records.
•	IND-M2: Browse screen shows case number, decedent, received-by, received date, etc.
•	IND-M3: Referral screen fields (case number, received by/date/time, notified by, decedent demographics, address, death info, physician info, etc.).
•	IND-M4: Auto-fill referral fields from Investigation screen data for selected indigent record.
•	IND-M5: NOK/Disposition screen tracks NOK details + disposition (e.g., cremation) + funding/voucher details.
•	IND-M6: Narrative screen stores notes for indigent case.
5.6 Investigation module (INV)
•	INV-M1: Ownership rule: owner investigator can update case; others can update all screens except Narrative (view allowed).
•	INV-M2: Browse screen fields include case number, decedent, race/sex/age, police-hold, received date, investigator, case status (pending/unpend), priority.
•	INV-M3: Notification screen tracks case #/type (BME or NME), investigator, received dt/tm, decedent name, birth/death dt/tm, race/sex, notifier info, transport, meds found, etc.
•	INV-M4: Vitals screen tracks address, phone, occupation, alias, trauma history, etc.
•	INV-M5: Incident/Death screen tracks last seen alive, incident date, death location/address + zip, etc.
•	INV-M6: Disposition screen tracks identifiers, physician, NOK contact info, etc.
•	INV-M7: Narrative notes:
o	Authorized users add/update notes
o	Free-form text
o	Spell check incl. medical terminology
o	Initiation date
o	Printable on reports
•	INV-M8: Police Hold screen:
o	Track hold placed date/time, requester, release info
o	Only Pathologist + Investigator can update
•	INV-M9: Special security for Police Hold cases:
o	Must indicate visually (highlight color etc.)
o	No info released to outsiders until hold released
•	INV-M10: Print Death Certificate after populating fields.
•	INV-M11: Duplicate detection when entering new investigation case (same first/last/middle).
5.7 Laboratory / Toxicology (LAB)
•	LAB-M1a: Bar coding to monitor specimens/evidence for chain of custody.
•	LAB-M1b: Bar code tech included; option to upgrade/be compatible with RFID.
•	LAB-M2: Encrypt suspect/victim name for all toxicology cases in DB; decrypt only for reporting/app use.
•	LAB-M3: Prevent printing tox reports until finalized; tox reports in Final Review cannot be printed via external reporting program.
•	LAB-M4: Medical Examiner Commissioner Statistics form integrated; auto-population and printing; heroin deaths separated from hospice/terminal/morphine cases.
•	LAB-M5: Instrument interfaces: build interface so data transfers electronically from instruments/software into E MedEx DB after review/approval; automatically populates fields (eliminates clerical entry).
•	LAB-M6: Archive specimens when inactivity threshold reached; flagged items viewable on screen or printed report.
•	LAB-M7: Override option to retain samples longer than specified time (per statute).
•	LAB-M8: Log/track changes to historical info; recall/restore change history; restoration occurrences tracked.
•	LAB-M9: Browse screen shows case basics (case #, deceased/suspect/victim, priority, status, agency, investigator, etc.).
•	LAB-M10: Receive screen differs for BME vs TOX (TOX receiving at top, sample info bottom; BME only sample bottom).
•	LAB-M11: Assign tests to samples; monitor test status; whether sent out.
•	LAB-M12: Barcode encodes case number, name, specimen/evidence id, subdivisions/descriptions (tube 1 of 4, etc.).
•	LAB-M13: Schedule screen “Work List” (only cases started=Y).
•	LAB-M14: Schedule screen “To Do List” by test (all cases needing that test regardless started/not started).
•	LAB-M15: Schedule screen “Default List” sorted by specimen/case number.
•	LAB-M16: Track/print historical work lists.
•	LAB-M17: Configure/customize lists requested by users on schedule screen.
•	LAB-M18: Assign ownership to analyst starting tests; show on schedule.
•	LAB-M19: Results screen sets case status to STOP when populated from instruments; record responsible person + datetime.
•	LAB-M20: Auto-populate linked fields to reduce repetitive entry; rules configurable.
•	LAB-M21: Import boilerplate statements into final tox report based on drug concentration range.
•	LAB-M22: Enter preliminary results; choose which are confirmed and included in final tox.
•	LAB-M23: Status screen can filter/search case statuses.
•	LAB-M24: Final Review fits fields vertically (vertical scroll, not horizontal).
•	LAB-M25: Final Review tracks/display reviewed date.
•	LAB-M26: Final Review supports preview reports for preliminary/complete tox before signing final.
•	LAB-M27: Final Review filter reports: Unconfirmed vs External vs Internal results.
•	LAB-M28: Send Out screen tracks specimens sent out: lab name, sender, received info, specimen returned, etc.
•	LAB-M29: Retain screen tracks retention per law.
•	LAB-M30: Mark-for-disposal before disposal.
•	LAB-M31: Track transition marked-for-disposal → disposed; periodically purge disposed after confirmation report.
•	LAB-M32: Fee screen tracks tox fees.
•	LAB-M33: Fee reports from Final Review including notarized section; based on Fee Table rules.
•	LAB-M34: Populate tox invoice for reimbursement (official county invoice to State Attorney).
•	LAB-M35: Trace chain of custody of all specimens and other investigator evidence.
•	LAB-M36: Combine Toxicology module with Laboratory module.
5.8 Medications (MED)
•	MED-M1: Track medications collected (drug, prescribing doctor, pharmacy, RX info, dosage, prescribed vs remaining, etc.) with appropriate HIPAA security.
5.9 Pathology (PAT)
•	PAT-M1: Cause/Manner screen prints case-specific body diagrams.
•	PAT-M2: Sample screen prepopulates standard samples; doctors mark collected; collected samples automatically sent to LAB; “INCLUDE ALL” option; samples then available to TOX.
•	PAT-M2b: Barcode scanning by TOX updates chain of custody.
•	PAT-M3: Protocol screen security:
o	Only doctors see protocols
o	Rich text in protocols
o	Owner pathologist can modify; other pathologists view
o	Once finalized (signatures), protocol scanned in
o	After scan: original not modifiable/viewable
o	Must append tox report at bottom of protocol before scanning for future reference
•	PAT-M4: Case tracking: special note for why case still open.
•	PAT-M5: Evidence custody screen tracks property receipt/chain of custody/item desc/received/released info/pathologist etc.
•	PAT-M6: Special tests screen tracks send-out specimen/test/results/received info etc.
•	PAT-M7: Notes: include date field when note added.
•	PAT-M8: Retain multiple versions of death certificate (pending/unpending).
•	PAT-M9: Print blank body diagram with filled info; doctor draws; scan back if needed.
•	PAT-M10: Pathology ownership: assigned doctor updates; others view only (admin exception).
•	PAT-M11: Cross-reference BME↔NME case transitions.
•	PAT-M12: Browse shows case #, decedent, race/sex/age, received date, investigator, cause/manner.
•	PAT-M13: Cause/Manner screen captures autopsy date/time; cause of death (primary + up to 3 due-to); contributory; manner; injury description; plus one key statistical field (domestic violence, homicide-suicide, etc.).
•	PAT-M14: Show date when doctors un-pend the case.
5.10 Photography (PHO)
•	PHO-M1: Store pictures (JPG/PNG/TIFF/RAW); each has photo shot + photo type.
•	PHO-M2: Thumbnail screen showing all pictures (from drive).
•	PHO-M3: 100–250 pics per case; file naming pattern: BME2005-0001-001 (case # + 3-digit photo #).
•	PHO-M4: Special security for photos (confidential/exempt from public record).
5.11 Queries/Search (QUE)
•	QUE-M1: User-friendly queries for non-experts.
•	QUE-M2: Consistent, powerful search with accurate results and appropriate response times.
•	QUE-M3: Querying can use values from every dropdown menu.
5.12 Reporting (RPT)
•	RPT-M1: Standard reports (cremation summary/detail, death certificate, cause of death, investigation, tox reports; formats in Appendix 8).
•	RPT-M2: Automated statistical report per Annual Medical Examiner Commission Report.
•	RPT-M3: FDLE Alcohol Testing Program form integrated and populated accurately.
•	RPT-M4: Reporting software training for management + staff.
•	RPT-M5: Report generator to create customized reports with charts/graphs; may integrate into system.
•	RPT-M6: Lab reports can include selected notes; include/exclude external lab results.
•	RPT-M7: Data dictionary used for flexible report creation.
•	RPT-M8: View reports online before printing.
5.13 Screens / UI behavior (SCR)
•	SCR-M1: Each case has status + priority.
•	SCR-M2: Rich text formatting in comments/notes/emails.
•	SCR-M3: Dropdowns support “type first letter” quick navigation.
•	SCR-M4: Spell check supports regular + medical + tox dictionaries.
•	SCR-M5: Keep existing case-number formats/prefixes + year + dash + sequence rules.
•	SCR-M6: Generate case numbers; no skipped numbers.
•	SCR-M7: Print screens on request.
•	SCR-M8: Every screen has top section with case #, decedent name, case status, case priority.
•	SCR-M9: Browse screen similar to existing system:
o	view all cases + filter by year
o	important fields selected by users
o	no horizontal scrolling
•	SCR-M10: Comments/notes attachable to modules/fields; multiple notes; includable in reports.
5.14 Security (SEC)
•	SEC-M1: UserID + password access control.
•	SEC-M2: UserID format same as AD; password rules adhere to AD complexity policy described.
•	SEC-M3: DBA can determine authorization levels of user groups.
•	SEC-M4: Group-level security by functional area.
•	SEC-M5: Extended consistent audit trail.
•	SEC-M6: Configurable multi-level security for user groups.
•	SEC-M7: Report generator table access is read-only and controlled by METS personnel.
5.15 System / non-functional (SYS)
•	SYS-M1: Configurable tools (add fields, make required, design screen layouts, etc.).
•	SYS-M2: Implement role-based security model.
•	SYS-M3: Follow application standards / Windows interface standards.
•	SYS-M4: Follow internet standards compatible with supported browser.
•	SYS-M5: Comply with web standards (JavaScript, IE6+, HTML).
•	SYS-M6: Refer to standards for .NET/SQL Server/Oracle versions.
•	SYS-M7: Enterprise licensing: unlimited server copies + concurrent/floating users; includes sandbox/test/prod/HA/backup/recovery/DR.
•	SYS-M8: Hosted internally (no offsite hosting).
•	SYS-M9: Provide required services; define and deposit source code to escrow configured for County installation.
•	SYS-M10: Availability beyond business hours: 6AM–9PM; seven days a week (mandatory).
•	SYS-M11: Maintenance that impacts availability must be coordinated/scheduled with County.
•	SYS-M12: Open architecture; web services; authentication required for web services.
•	SYS-M13: Backend processing runs overnight.
•	SYS-M14: Scalability to thousands+ records; supports stated volumes/users.
•	SYS-M15: Must not cache data while users use system; clear on navigation/close for security.
•	SYS-M16: Business continuity; failures/disasters; interfaces not adversely affected.
•	SYS-M17: Contingency plans so instrument systems (Magellan, ChemStation, etc.) not adversely affected.
•	SYS-M18: Handle failures; major unusable failures no more than twice/year.
•	SYS-M19: Critical outage fixed within 4 hours of notification; continuous work until resolved/workaround; other failures acknowledged within 4 hours.
•	SYS-M20: 99% accuracy of data matching from source.
•	SYS-M21: Defect rate <1%.
•	SYS-M22: Document change management methodology; releases must conform.
•	SYS-M23: Leading technologies per standards; upgrade path between language versions expected.
•	SYS-M24a: Change history of critical info + restoration; track restoration occurrences.
•	SYS-M24b: Archive unused info; available via archive reports/screens.
•	SYS-M25: Based on existing business processes; avoid unnecessary steps; configurable to adapt.
•	SYS-M26: Intuitive/self-explanatory for Windows-familiar users.
•	SYS-M27: Keyboard or mouse navigation.
•	SYS-M28: Drop-down values maintainable by designated ME personnel.
•	SYS-M29: Five-year maintenance/support including patches + releases + third-party updates.
•	SYS-M30: Maintenance via remote access (dev/test only) must comply with County security policy.
•	SYS-M31: Minimum one-year product warranty.
•	SYS-M33: Proposed infrastructure supportable by County staff.
•	SYS-M34: Existing clients with similar infrastructure.
•	SYS-M35: Field-level security available.
•	SYS-M36: Security incidents/breaches reported/logged + notifications to DBA.
•	SYS-M37: Flexible security: logs of successful/unsuccessful logins; restrict access by user/group/location/unit etc.
•	SYS-M38: Passwords not stored in clear text or easily reversible form.
5.16 Training / documentation (TRN)
•	TRN-M1: User manual + system manual; online help.
•	TRN-M2: Training manuals hardcopy + electronic; available at training time.
•	TRN-M3: Online training manual; each user manual topic also in online help.
•	TRN-M4: Reviewed/approved docs delivered at handover.
•	TRN-M5: Training limited to County employees; 4–8 hour instructor-led course.
•	TRN-M6: Training for OIT Customer Service Center for common issues.
•	TRN-M7: Training manuals produced collaboratively; County management approves; group training + self-help modules for new hires.
•	TRN-M8: On-site training covering configuration, report generation, importing/extracting/interfacing, admin/security, core users.
________________________________________
6) Optional (“Like to have”) requirements — Exhibit 4
General optional (ALL-L*)
•	ALL-L0: If VB6, provide detailed migration plan to .NET.
•	ALL-L1: App support limitations + service levels (response, resolution, escalation).
•	ALL-L2: Clients request/prioritize enhancements for future releases.
•	ALL-L3: How user feedback affects enhancements.
•	ALL-L4: Effect of Broward custom modifications on upgrades.
•	ALL-L5: Modular system; list modules.
•	ALL-L6: Pop-up calendars.
•	ALL-L7: Editable help text.
•	ALL-L8: Year software originally written.
•	ALL-L9: Number of current version installs.
•	ALL-L10: Current release version.
•	ALL-L11: Next planned release version + description.
•	ALL-L12: Planned release date of next version.
•	ALL-L13: Pricing model.
•	ALL-L14–L17: Client CPU/RAM/HDD and screen resolution requirements.
•	ALL-L18: Data encryption type.
•	ALL-L19: Form-level security.
•	ALL-L20: VPN tunneling support.
•	ALL-L21: Full remote (dial-in) terminal capability.
•	ALL-L22: Recommended server specs.
•	ALL-L23: Data import/export capabilities + Office compatibility.
•	ALL-L24: Integrations done historically and purposes.
•	ALL-L25: User-defined password expiration interval.
•	ALL-L26: External web server outside firewall validates user before access inside firewall.
•	ALL-L27: Forgot password/reset mechanism.
•	ALL-L28: Drill-down.
•	ALL-L29: Passwords expire periodically.
•	ALL-L30: Help desk staffing and hours.
FRH optional
•	FRH-L1: After-hours body drop-off workflow (currently manual log).
LAB optional
•	LAB-L1: Final review print generates report immediately without asking case number.
•	LAB-L2: Reports uniquely ordered per case (e.g., parent drug with metabolites).
•	LAB-L3: Pre-coded inactivity duration for archiving date.
•	LAB-L4: Barcoding implementation plan.
•	LAB-L5: RFID future implementation plan.
•	LAB-L6: Prefer open, industry-standard barcoding (not proprietary).
•	LAB-L7: Prefer 12 scanners/printers for barcoding.
•	LAB-L8: Provide reference site for RFID implementation.
Query optional
•	QUE-L1: Google-like search across text fields.
•	QUE-L2: Search-as-you-type suggestions; ability to build custom search screens; search results link to special screens; search drives reports; includes demographics + tox details + protocol diagnosis list.
Reporting optional
•	RPT-L1: Standard report templates.
Screens/UI optional
•	SCR-L1: Tree-view navigation (like Windows Explorer) based on authorization.
•	SCR-L2: Priority highlighting with colors.
•	SCR-L3: Follow Broward intranet look/feel where possible.
Security optional
•	SEC-L1: Replicated DB or data warehouse for reporting (if possible).
System optional
•	SYS-L1: Detailed warranty description.
•	SYS-L2: Historical cost/frequency of upgrades.
Training optional
•	TRN-L1: Broward County logo on documentation and screens.
________________________________________
7) Database schema artifacts you provided (what this implies you’ll likely need in the app)
From medextables.sql (SQL Anywhere schema), the app should at minimum support entities/tables for:
•	Cases / modules: INVESTIGATION, INVESTIGATION2, PATHOLOGY, FORENSIC, HISTOLOGY, PROTOCOL, POLICE, CLOSED_CASE
•	Laboratory/tox: LAB_CONTROL, LAB_RECEIVING, TEST_ASSIGNMENT, TEST_RESULT, SEND_OUT, LAB_REVIEW, LAB_NOTE, TOX_CASES, TOX_SAMPLES
•	Supporting dictionaries: AGENCY, RACE, CITY, STATE, COUNTY, CASE_TYPE, PLACE, DEATH_LOCATION, NOK, SPECIMEN, TEST, UNIT, RESULT, TESTPROC, RANGE, etc.
•	Evidence/photos: EVIDENCE_CUSTODY, PHOTOGRAPHY, DIRECTORY_TABLE
•	Cremation/indigent: CREMATION, INDIGENT
•	Users: EMPLOYEE, EMPL_GROUP
•	System sequencing: SYSTEM_TABLE (sequence counters like BME_SEQ, NME_SEQ, etc.)
(Those aren’t “requirements” by themselves, but they are a strong hint of the data model you’ll implement.)
