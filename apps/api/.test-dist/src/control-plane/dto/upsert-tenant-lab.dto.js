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
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min, ValidateNested, } from 'class-validator';
class TenantLabRoutingRulesDto {
    testTypes;
    specimenTypes;
    caseTypes;
    agencies;
    priorityOnly;
    priority;
}
__decorate([
    IsOptional(),
    IsArray(),
    ArrayMaxSize(32),
    IsString({ each: true }),
    __metadata("design:type", Array)
], TenantLabRoutingRulesDto.prototype, "testTypes", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    ArrayMaxSize(32),
    IsString({ each: true }),
    __metadata("design:type", Array)
], TenantLabRoutingRulesDto.prototype, "specimenTypes", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    ArrayMaxSize(32),
    IsString({ each: true }),
    __metadata("design:type", Array)
], TenantLabRoutingRulesDto.prototype, "caseTypes", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    ArrayMaxSize(64),
    IsString({ each: true }),
    __metadata("design:type", Array)
], TenantLabRoutingRulesDto.prototype, "agencies", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], TenantLabRoutingRulesDto.prototype, "priorityOnly", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(0),
    Max(1000),
    __metadata("design:type", Number)
], TenantLabRoutingRulesDto.prototype, "priority", void 0);
export class UpsertTenantLabDto {
    displayName;
    mllpHost;
    mllpPort;
    isActive;
    routingRules;
}
__decorate([
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], UpsertTenantLabDto.prototype, "displayName", void 0);
__decorate([
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], UpsertTenantLabDto.prototype, "mllpHost", void 0);
__decorate([
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(65535),
    __metadata("design:type", Number)
], UpsertTenantLabDto.prototype, "mllpPort", void 0);
__decorate([
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpsertTenantLabDto.prototype, "isActive", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => TenantLabRoutingRulesDto),
    __metadata("design:type", TenantLabRoutingRulesDto)
], UpsertTenantLabDto.prototype, "routingRules", void 0);
