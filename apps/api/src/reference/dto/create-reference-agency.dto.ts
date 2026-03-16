import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReferenceAgencyDto {
  @IsString()
  @MaxLength(255)
  agencyName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agencyType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  fax?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;
}