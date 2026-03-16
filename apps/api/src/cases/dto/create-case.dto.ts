import { IsBoolean, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCaseDto {
  @IsUUID()
  clientCaseUuid!: string;

  @IsString()
  @MaxLength(64)
  temporaryCaseNumber!: string;

  @IsString()
  @MaxLength(16)
  caseType!: string;

  @IsOptional()
  @IsBoolean()
  policeHold?: boolean;

  @IsOptional()
  @IsBoolean()
  priority?: boolean;

  @IsOptional()
  @IsObject()
  demographics?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  intakeSummary?: Record<string, unknown>;
}