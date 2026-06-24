import { IntersectionType } from '@nestjs/swagger';

import { BaseResponseDTO } from '@lib/common';

import { CreateTrainerDTO } from './create-trainer.dto';

/**
 * Response shape for a trainer — create fields plus the inherited audit fields
 * (`id`, `created_at`, `updated_at`, ...) from {@link BaseResponseDTO}.
 */
export class TrainerResponseDTO extends IntersectionType(CreateTrainerDTO, BaseResponseDTO) {}
