import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsISO8601, IsObject, IsString, MaxLength, ValidateNested } from 'class-validator';

class OfflineAuditEventInputDto {
  @IsString()
  @MaxLength(128)
  userId!: string;

  @IsString()
  @MaxLength(128)
  deviceId!: string;

  @IsString()
  @MaxLength(64)
  eventType!: string;

  @IsObject()
  eventPayload!: Record<string, unknown>;

  @IsISO8601()
  eventAt!: string;
}

export class IngestOfflineAuditEventsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfflineAuditEventInputDto)
  events!: OfflineAuditEventInputDto[];
}