import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProtocolVersionDto {
  @IsOptional()
  @IsString()
  protocolBody?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  authoredBy?: string;
}