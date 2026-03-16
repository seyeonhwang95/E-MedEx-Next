var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto.js';
export class ListHl7MessagesQueryDto extends PaginationQueryDto {
    labCode;
    direction;
    messageType;
    processingState;
}
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(64),
    __metadata("design:type", String)
], ListHl7MessagesQueryDto.prototype, "labCode", void 0);
__decorate([
    IsOptional(),
    IsIn(['Inbound', 'Outbound']),
    __metadata("design:type", String)
], ListHl7MessagesQueryDto.prototype, "direction", void 0);
__decorate([
    IsOptional(),
    IsIn(['ORM_O01', 'ORU_R01', 'ACK']),
    __metadata("design:type", String)
], ListHl7MessagesQueryDto.prototype, "messageType", void 0);
__decorate([
    IsOptional(),
    IsIn(['Received', 'Validated', 'Mapped', 'Failed']),
    __metadata("design:type", String)
], ListHl7MessagesQueryDto.prototype, "processingState", void 0);
