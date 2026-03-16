import { IsOptional, IsString } from 'class-validator';

export class SignReportDto {
  @IsOptional()
  @IsString()
  note?: string;
}