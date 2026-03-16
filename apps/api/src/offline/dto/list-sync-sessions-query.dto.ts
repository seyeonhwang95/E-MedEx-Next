import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

const syncStates = ['LocalOnly', 'Queued', 'Syncing', 'Synced', 'Error'] as const;

export class ListSyncSessionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsString()
  @IsIn(syncStates)
  syncState?: (typeof syncStates)[number];
}