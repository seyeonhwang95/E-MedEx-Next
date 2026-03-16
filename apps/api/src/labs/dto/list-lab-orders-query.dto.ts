import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListLabOrdersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  labCode?: string;

  @IsOptional()
  @IsIn(['Created', 'Sent', 'Ack', 'InProgress', 'Partial', 'Final', 'Verified', 'Finalized'])
  status?: 'Created' | 'Sent' | 'Ack' | 'InProgress' | 'Partial' | 'Final' | 'Verified' | 'Finalized';
}