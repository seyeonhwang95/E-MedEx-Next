import { IsBoolean, IsObject, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LabRoutingContextDto {
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
}

export class CreateLabOrderDto {
  @IsUUID()
  caseId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  labCode?: string;

  @IsString()
  @MaxLength(128)
  orderNumber!: string;

  @IsObject()
  orderedItems!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LabRoutingContextDto)
  routingContext?: LabRoutingContextDto;
}