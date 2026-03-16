import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AssignCanonicalNumberDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  prefix?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(3000)
  caseYear?: number;
}