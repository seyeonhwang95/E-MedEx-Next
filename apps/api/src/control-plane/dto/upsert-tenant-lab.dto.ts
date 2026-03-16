import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class TenantLabRoutingRulesDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(32)
  @IsString({ each: true })
  testTypes?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(32)
  @IsString({ each: true })
  specimenTypes?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(32)
  @IsString({ each: true })
  caseTypes?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  agencies?: string[];

  @IsOptional()
  @IsBoolean()
  priorityOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  priority?: number;
}

export class UpsertTenantLabDto {
  @IsString()
  @MaxLength(128)
  displayName!: string;

  @IsString()
  @MaxLength(255)
  mllpHost!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  mllpPort!: number;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TenantLabRoutingRulesDto)
  routingRules?: TenantLabRoutingRulesDto;
}