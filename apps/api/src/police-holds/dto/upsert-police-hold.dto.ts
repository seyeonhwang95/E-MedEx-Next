import { IsBoolean, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertPoliceHoldDto {
  @IsBoolean()
  held!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  requestedBy?: string;

  @IsOptional()
  @IsISO8601()
  requestedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  releasedBy?: string;

  @IsOptional()
  @IsISO8601()
  releasedAt?: string;

  @IsOptional()
  @IsString()
  note?: string;
}