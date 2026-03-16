import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListCasesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  caseType?: string;

  @IsOptional()
  @IsIn(['Intake', 'InProgress', 'Review', 'Finalized', 'Locked'])
  status?: 'Intake' | 'InProgress' | 'Review' | 'Finalized' | 'Locked';
}