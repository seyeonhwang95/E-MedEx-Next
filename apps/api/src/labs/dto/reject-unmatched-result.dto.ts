import { IsOptional, IsString } from 'class-validator';

export class RejectUnmatchedResultDto {
  @IsOptional()
  @IsString()
  reason?: string;
}