export const caseStatuses = ['Intake', 'InProgress', 'Review', 'Finalized', 'Locked'] as const;

export const appShellSections = [
  {
    id: 'cases',
    title: 'Case workspace',
    description: 'Unified case, timeline, flags, assignments, and alias numbers.',
  },
  {
    id: 'intake',
    title: 'Offline intake',
    description: 'Local encrypted intake for field mobile and desktop workflows.',
  },
  {
    id: 'lab',
    title: 'HL7 toxicology',
    description: 'Multi-lab routing, MLLP transport, reconciliation, and result review.',
  },
  {
    id: 'media',
    title: 'Media and evidence',
    description: 'Secure media, thumbnails, custody chain, and barcode-first workflows.',
  },
  {
    id: 'admin',
    title: 'Tenant admin',
    description: 'Provisioning, roles, devices, labs, and audit oversight.',
  },
  {
    id: 'performance',
    title: 'Performance SLOs',
    description: 'Measured p95 targets with CI regression gates.',
  },
] as const;

export type CaseStatus = (typeof caseStatuses)[number];