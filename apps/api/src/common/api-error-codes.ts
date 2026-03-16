export const apiErrorCodes = {
  InvalidCursor: 'INVALID_CURSOR',
  LabOverrideNotAvailable: 'LAB_OVERRIDE_NOT_AVAILABLE',
  ReportExportReportNotSigned: 'REPORT_EXPORT_REPORT_NOT_SIGNED',
  ReportExportProtocolNotFinal: 'REPORT_EXPORT_PROTOCOL_NOT_FINAL',
  ProtocolFinalImmutable: 'PROTOCOL_FINAL_IMMUTABLE',
  ProtocolFinalImmutableCreateNewVersion: 'PROTOCOL_FINAL_IMMUTABLE_CREATE_NEW_VERSION',
} as const;

export type ApiErrorCode = (typeof apiErrorCodes)[keyof typeof apiErrorCodes];