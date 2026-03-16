import { Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertCremationCaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  funeralHomeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  approvedBy?: string;

  @IsOptional()
  @IsISO8601()
  approvedAt?: string;

  @IsOptional()
  @IsBoolean()
  indigent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fee?: number;
}