var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsISO8601, IsObject, IsString, MaxLength, ValidateNested } from 'class-validator';
class OfflineAuditEventInputDto {
    userId;
    deviceId;
    eventType;
    eventPayload;
    eventAt;
}
__decorate([
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], OfflineAuditEventInputDto.prototype, "userId", void 0);
__decorate([
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], OfflineAuditEventInputDto.prototype, "deviceId", void 0);
__decorate([
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], OfflineAuditEventInputDto.prototype, "eventType", void 0);
__decorate([
    IsObject(),
    __metadata("design:type", Object)
], OfflineAuditEventInputDto.prototype, "eventPayload", void 0);
__decorate([
    IsISO8601(),
    __metadata("design:type", String)
], OfflineAuditEventInputDto.prototype, "eventAt", void 0);
export class IngestOfflineAuditEventsDto {
    events;
}
__decorate([
    IsArray(),
    ArrayMinSize(1),
    ValidateNested({ each: true }),
    Type(() => OfflineAuditEventInputDto),
    __metadata("design:type", Array)
], IngestOfflineAuditEventsDto.prototype, "events", void 0);
