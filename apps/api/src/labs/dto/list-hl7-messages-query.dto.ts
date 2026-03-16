import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../common/pagination.dto.js';

export class ListHl7MessagesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  labCode?: string;

  @IsOptional()
  @IsIn(['Inbound', 'Outbound'])
  direction?: 'Inbound' | 'Outbound';

  @IsOptional()
  @IsIn(['ORM_O01', 'ORU_R01', 'ACK'])
  messageType?: 'ORM_O01' | 'ORU_R01' | 'ACK';

  @IsOptional()
  @IsIn(['Received', 'Validated', 'Mapped', 'Failed'])
  processingState?: 'Received' | 'Validated' | 'Mapped' | 'Failed';
}