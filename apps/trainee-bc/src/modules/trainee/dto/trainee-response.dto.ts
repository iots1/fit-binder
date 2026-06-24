import { IntersectionType } from '@nestjs/swagger';

import { BaseResponseDTO } from '@lib/common';

import { CreateTraineeDTO } from './create-trainee.dto';

export class TraineeResponseDTO extends IntersectionType(CreateTraineeDTO, BaseResponseDTO) {}
