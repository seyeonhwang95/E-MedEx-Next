import { IsISO8601, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertInvestigationDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  investigatorUserId?: string;

  @IsOptional()
  @IsISO8601()
  receivedAt?: string;

  @IsOptional()
  @IsISO8601()
  incidentAt?: string;

  @IsOptional()
  @IsISO8601()
  deathAt?: string;

  @IsOptional()
  @IsObject()
  deathLocation?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  narrative?: string;
}