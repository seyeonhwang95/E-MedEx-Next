var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsBoolean, IsObject, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class LabRoutingContextDto {
    testType;
    specimenType;
    caseType;
    agency;
    priority;
}
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], LabRoutingContextDto.prototype, "testType", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], LabRoutingContextDto.prototype, "specimenType", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(16),
    __metadata("design:type", String)
], LabRoutingContextDto.prototype, "caseType", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], LabRoutingContextDto.prototype, "agency", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], LabRoutingContextDto.prototype, "priority", void 0);
export class CreateLabOrderDto {
    caseId;
    labCode;
    orderNumber;
    orderedItems;
    routingContext;
}
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], CreateLabOrderDto.prototype, "caseId", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], CreateLabOrderDto.prototype, "labCode", void 0);
__decorate([
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], CreateLabOrderDto.prototype, "orderNumber", void 0);
__decorate([
    IsObject(),
    __metadata("design:type", Object)
], CreateLabOrderDto.prototype, "orderedItems", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => LabRoutingContextDto),
    __metadata("design:type", LabRoutingContextDto)
], CreateLabOrderDto.prototype, "routingContext", void 0);
