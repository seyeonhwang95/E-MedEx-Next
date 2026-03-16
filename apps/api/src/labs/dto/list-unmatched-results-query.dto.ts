import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListUnmatchedResultsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  labCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: 'Open' | 'Matched' | 'Rejected';
}