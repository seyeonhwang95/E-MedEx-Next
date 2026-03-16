import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcknowledgeOfflineGrantWipeDto {
  @ApiProperty({ example: 'grant-id-123', description: 'Grant identifier' })
  @IsString()
  @MaxLength(128)
  grantId!: string;

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
}