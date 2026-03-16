import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateEvidenceItemDto {
  @IsUUID()
  caseId!: string;

  @IsString()
  @MaxLength(64)
  itemCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  storageLocation?: string;
}