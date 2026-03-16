import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReferenceCaseTypeDto {
  @IsString()
  @MaxLength(16)
  caseTypeCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}