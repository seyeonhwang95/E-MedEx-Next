var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
const syncStates = ['LocalOnly', 'Queued', 'Syncing', 'Synced', 'Error'];
export class UpsertSyncSessionDto {
    caseId;
    userId;
    deviceId;
    syncState;
    lastErrorCode;
    lastErrorMessage;
    lastSyncedAt;
}
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], UpsertSyncSessionDto.prototype, "caseId", void 0);
__decorate([
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], UpsertSyncSessionDto.prototype, "userId", void 0);
__decorate([
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], UpsertSyncSessionDto.prototype, "deviceId", void 0);
__decorate([
    IsString(),
    IsIn(syncStates),
    __metadata("design:type", Object)
], UpsertSyncSessionDto.prototype, "syncState", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], UpsertSyncSessionDto.prototype, "lastErrorCode", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpsertSyncSessionDto.prototype, "lastErrorMessage", void 0);
__decorate([
    IsOptional(),
    IsISO8601(),
    __metadata("design:type", String)
], UpsertSyncSessionDto.prototype, "lastSyncedAt", void 0);
