import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMediaAssetDto {
  @IsUUID()
  caseId!: string;

  @IsString()
  @MaxLength(32)
  mediaType!: string;

  @IsString()
  @MaxLength(512)
  objectKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  contentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sha256?: string;

  @IsOptional()
  @IsISO8601()
  capturedAt?: string;
}