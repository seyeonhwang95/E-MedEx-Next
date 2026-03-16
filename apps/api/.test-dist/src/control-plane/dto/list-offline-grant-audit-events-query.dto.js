var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto.js';
export class ListOfflineGrantAuditEventsQueryDto extends PaginationQueryDto {
    tenantId;
    eventType;
    from;
    to;
    sort;
    cursor;
}
__decorate([
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], ListOfflineGrantAuditEventsQueryDto.prototype, "tenantId", void 0);
__decorate([
    IsOptional(),
    IsString(),
    IsIn([
        'offline_grant_enrolled',
        'offline_grant_validated',
        'offline_grant_revoked',
        'offline_grant_wipe_acknowledged',
    ]),
    __metadata("design:type", String)
], ListOfflineGrantAuditEventsQueryDto.prototype, "eventType", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], ListOfflineGrantAuditEventsQueryDto.prototype, "from", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], ListOfflineGrantAuditEventsQueryDto.prototype, "to", void 0);
__decorate([
    IsOptional(),
    IsString(),
    IsIn(['eventAt:desc', 'eventAt:asc']),
    __metadata("design:type", String)
], ListOfflineGrantAuditEventsQueryDto.prototype, "sort", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(512),
    __metadata("design:type", String)
], ListOfflineGrantAuditEventsQueryDto.prototype, "cursor", void 0);
