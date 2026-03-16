var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AcknowledgeOfflineGrantWipeDto {
    grantId;
    tenantId;
    userId;
    deviceId;
    scope;
}
__decorate([
    ApiProperty({ example: 'grant-id-123', description: 'Grant identifier' }),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], AcknowledgeOfflineGrantWipeDto.prototype, "grantId", void 0);
__decorate([
    ApiProperty({ example: 'demo', description: 'Tenant ID' }),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], AcknowledgeOfflineGrantWipeDto.prototype, "tenantId", void 0);
__decorate([
    ApiProperty({ example: 'field-user-1', description: 'User/field staff ID' }),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], AcknowledgeOfflineGrantWipeDto.prototype, "userId", void 0);
__decorate([
    ApiProperty({ example: 'device-1', description: 'Device identifier' }),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], AcknowledgeOfflineGrantWipeDto.prototype, "deviceId", void 0);
__decorate([
    ApiProperty({ example: 'FieldIntake', description: 'Scope of offline grant', required: false }),
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], AcknowledgeOfflineGrantWipeDto.prototype, "scope", void 0);
