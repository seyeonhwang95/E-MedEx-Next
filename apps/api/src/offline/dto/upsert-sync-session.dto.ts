import { IsIn, IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

const syncStates = ['LocalOnly', 'Queued', 'Syncing', 'Synced', 'Error'] as const;

export class UpsertSyncSessionDto {
  @IsUUID()
  caseId!: string;

  @IsString()
  @MaxLength(128)
  userId!: string;

  @IsString()
  @MaxLength(128)
  deviceId!: string;

  @IsString()
  @IsIn(syncStates)
  syncState!: (typeof syncStates)[number];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  lastErrorCode?: string;

  @IsOptional()
  @IsString()
  lastErrorMessage?: string;

  @IsOptional()
  @IsISO8601()
  lastSyncedAt?: string;
}