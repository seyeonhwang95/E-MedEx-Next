export type CreateCaseRequest = {
  clientCaseUuid: string;
  temporaryCaseNumber: string;
  caseType: string;
  policeHold?: boolean;
  priority?: boolean;
  demographics?: Record<string, unknown>;
  intakeSummary?: Record<string, unknown>;
};

export type UpdateCaseStatusRequest = {
  status: 'Intake' | 'InProgress' | 'Review' | 'Finalized' | 'Locked';
};