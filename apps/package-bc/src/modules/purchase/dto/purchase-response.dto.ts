import { IntersectionType } from '@nestjs/swagger';

import { BaseResponseDTO } from '@lib/common';

import { CreatePurchaseDTO } from './create-purchase.dto';

/**
 * Response shape for a purchase. The entity's `NumericTransformer` already returns
 * `price_paid` as a JS number on read, so no extra `@Transform` is needed here.
 */
export class PurchaseResponseDTO extends IntersectionType(CreatePurchaseDTO, BaseResponseDTO) {}
