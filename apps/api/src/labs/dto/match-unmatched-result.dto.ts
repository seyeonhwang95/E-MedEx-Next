import { IsUUID } from 'class-validator';

export class MatchUnmatchedResultDto {
  @IsUUID()
  caseId!: string;
}