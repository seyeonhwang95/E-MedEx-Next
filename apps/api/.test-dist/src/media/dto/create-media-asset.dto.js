var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
export class CreateMediaAssetDto {
    caseId;
    mediaType;
    objectKey;
    fileName;
    contentType;
    sha256;
    capturedAt;
}
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], CreateMediaAssetDto.prototype, "caseId", void 0);
__decorate([
    IsString(),
    MaxLength(32),
    __metadata("design:type", String)
], CreateMediaAssetDto.prototype, "mediaType", void 0);
__decorate([
    IsString(),
    MaxLength(512),
    __metadata("design:type", String)
], CreateMediaAssetDto.prototype, "objectKey", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], CreateMediaAssetDto.prototype, "fileName", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(128),
    __metadata("design:type", String)
], CreateMediaAssetDto.prototype, "contentType", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], CreateMediaAssetDto.prototype, "sha256", void 0);
__decorate([
    IsOptional(),
    IsISO8601(),
    __metadata("design:type", String)
], CreateMediaAssetDto.prototype, "capturedAt", void 0);
