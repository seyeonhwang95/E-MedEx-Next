import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertIndigentCaseDto {
  @IsOptional()
  @IsString()
  referralNotes?: string;

  @IsOptional()
  @IsString()
  dispositionNotes?: string;

  @IsOptional()
  @IsObject()
  funding?: Record<string, unknown>;
}