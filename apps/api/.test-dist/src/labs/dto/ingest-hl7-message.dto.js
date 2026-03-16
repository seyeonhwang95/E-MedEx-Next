var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsString, MaxLength } from 'class-validator';
export class IngestHl7MessageDto {
    labCode;
    direction;
    rawMessage;
}
__decorate([
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], IngestHl7MessageDto.prototype, "labCode", void 0);
__decorate([
    IsIn(['Inbound', 'Outbound']),
    __metadata("design:type", String)
], IngestHl7MessageDto.prototype, "direction", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], IngestHl7MessageDto.prototype, "rawMessage", void 0);
