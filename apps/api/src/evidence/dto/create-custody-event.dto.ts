import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCustodyEventDto {
  @IsString()
  @MaxLength(32)
  eventType!: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  fromLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  toLocation?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsISO8601()
  eventAt!: string;
}