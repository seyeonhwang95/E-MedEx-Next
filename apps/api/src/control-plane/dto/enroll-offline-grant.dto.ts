import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollOfflineGrantDto {
  @ApiProperty({ example: 'demo', description: 'Tenant ID' })
  @IsString()
  @MaxLength(64)
  tenantId!: string;

  @ApiProperty({ example: 'field-user-1', description: 'User/field staff ID' })
  @IsString()
  @MaxLength(128)
  userId!: string;

  @ApiProperty({ example: 'device-1', description: 'Device identifier' })
  @IsString()
  @MaxLength(128)
  deviceId!: string;

  @ApiProperty({ example: 'FieldIntake', description: 'Scope of offline grant', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  scope?: 'FieldIntake';

  @ApiProperty({ example: 48, description: 'Time-to-live in hours (1-168, default 48)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
  ttlHours?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  issuedBy?: string;
}