import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListReferenceCaseTypesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  caseTypeCode?: string;
}