import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolveTenantLabDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  testType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  specimenType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  caseType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agency?: string;

  @IsOptional()
  @IsBoolean()
  priority?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  overrideLabCode?: string;

  @IsOptional()
  @IsString()
  overrideReason?: string;
}