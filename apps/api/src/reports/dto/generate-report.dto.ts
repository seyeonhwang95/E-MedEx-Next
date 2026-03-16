import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  templateId?: string;
}