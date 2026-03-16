import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListOfflineGrantsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  tenantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  userId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'revoked', 'expired'])
  status?: 'active' | 'revoked' | 'expired';
}