import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListEvidenceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;
}