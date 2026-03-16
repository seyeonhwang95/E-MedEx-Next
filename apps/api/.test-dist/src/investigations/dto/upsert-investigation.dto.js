var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsISO8601, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
export class UpsertInvestigationDto {
    investigatorUserId;
    receivedAt;
    incidentAt;
    deathAt;
    deathLocation;
    narrative;
}
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], UpsertInvestigationDto.prototype, "investigatorUserId", void 0);
__decorate([
    IsOptional(),
    IsISO8601(),
    __metadata("design:type", String)
], UpsertInvestigationDto.prototype, "receivedAt", void 0);
__decorate([
    IsOptional(),
    IsISO8601(),
    __metadata("design:type", String)
], UpsertInvestigationDto.prototype, "incidentAt", void 0);
__decorate([
    IsOptional(),
    IsISO8601(),
    __metadata("design:type", String)
], UpsertInvestigationDto.prototype, "deathAt", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], UpsertInvestigationDto.prototype, "deathLocation", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpsertInvestigationDto.prototype, "narrative", void 0);
