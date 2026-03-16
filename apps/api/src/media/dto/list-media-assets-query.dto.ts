import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListMediaAssetsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  mediaType?: string;
}