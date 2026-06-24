import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { PurchaseStatus } from '../enum/purchase-status.enum';
import { CreatePurchaseDTO } from './create-purchase.dto';

export class UpdatePurchaseDTO extends PartialType(CreatePurchaseDTO) {
    @ApiPropertyOptional({ enum: PurchaseStatus })
    @IsOptional()
    @IsEnum(PurchaseStatus)
    status: PurchaseStatus;
}
