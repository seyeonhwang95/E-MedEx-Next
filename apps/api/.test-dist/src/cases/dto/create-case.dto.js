var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsBoolean, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
export class CreateCaseDto {
    clientCaseUuid;
    temporaryCaseNumber;
    caseType;
    policeHold;
    priority;
    demographics;
    intakeSummary;
}
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "clientCaseUuid", void 0);
__decorate([
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "temporaryCaseNumber", void 0);
__decorate([
    IsString(),
    MaxLength(16),
    __metadata("design:type", String)
], CreateCaseDto.prototype, "caseType", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateCaseDto.prototype, "policeHold", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateCaseDto.prototype, "priority", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], CreateCaseDto.prototype, "demographics", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], CreateCaseDto.prototype, "intakeSummary", void 0);
