import { IntersectionType } from '@nestjs/swagger';

import { BaseResponseDTO } from '@lib/common';

import { CreatePackageDTO } from './create-package.dto';

/**
 * Response shape for a package. The entity's `NumericTransformer` already returns
 * `price` as a JS number on read, so no extra `@Transform` is needed here.
 */
export class PackageResponseDTO extends IntersectionType(CreatePackageDTO, BaseResponseDTO) {}
