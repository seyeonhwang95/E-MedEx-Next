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
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class EnrollOfflineGrantDto {
    tenantId;
    userId;
    deviceId;
    scope;
    ttlHours;
    issuedBy;
}
__decorate([
    ApiProperty({ example: 'demo', description: 'Tenant ID' }),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], EnrollOfflineGrantDto.prototype, "tenantId", void 0);
__decorate([
    ApiProperty({ example: 'field-user-1', description: 'User/field staff ID' }),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], EnrollOfflineGrantDto.prototype, "userId", void 0);
__decorate([
    ApiProperty({ example: 'device-1', description: 'Device identifier' }),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], EnrollOfflineGrantDto.prototype, "deviceId", void 0);
__decorate([
    ApiProperty({ example: 'FieldIntake', description: 'Scope of offline grant', required: false }),
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], EnrollOfflineGrantDto.prototype, "scope", void 0);
__decorate([
    ApiProperty({ example: 48, description: 'Time-to-live in hours (1-168, default 48)', required: false }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(168),
    __metadata("design:type", Number)
], EnrollOfflineGrantDto.prototype, "ttlHours", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], EnrollOfflineGrantDto.prototype, "issuedBy", void 0);
