import { IsIn, IsString, MaxLength } from 'class-validator';

export class IngestHl7MessageDto {
  @IsString()
  @MaxLength(64)
  labCode!: string;

  @IsIn(['Inbound', 'Outbound'])
  direction!: 'Inbound' | 'Outbound';

  @IsString()
  rawMessage!: string;
}