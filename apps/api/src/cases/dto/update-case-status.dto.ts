import { IsIn } from 'class-validator';

export class UpdateCaseStatusDto {
  @IsIn(['Intake', 'InProgress', 'Review', 'Finalized', 'Locked'])
  status!: 'Intake' | 'InProgress' | 'Review' | 'Finalized' | 'Locked';
}