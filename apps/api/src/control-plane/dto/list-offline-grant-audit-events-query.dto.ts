import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListOfflineGrantAuditEventsQueryDto extends PaginationQueryDto {
  @IsString()
  @MaxLength(64)
  tenantId!: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'offline_grant_enrolled',
    'offline_grant_validated',
    'offline_grant_revoked',
    'offline_grant_wipe_acknowledged',
  ])
  eventType?:
    | 'offline_grant_enrolled'
    | 'offline_grant_validated'
    | 'offline_grant_revoked'
    | 'offline_grant_wipe_acknowledged';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @IsIn(['eventAt:desc', 'eventAt:asc'])
  sort?: 'eventAt:desc' | 'eventAt:asc';

  @IsOptional()
  @IsString()
  @MaxLength(512)
  cursor?: string;
}