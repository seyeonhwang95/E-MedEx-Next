export type CreateLabOrderRequest = {
  caseId: string;
  labCode: string;
  orderNumber: string;
  orderedItems: Record<string, unknown>;
};

export type IngestHl7MessageRequest = {
  labCode: string;
  direction: 'Inbound' | 'Outbound';
  rawMessage: string;
};