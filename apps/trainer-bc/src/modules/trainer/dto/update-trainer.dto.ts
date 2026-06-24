import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { TrainerStatus } from '../enum/trainer-status.enum';
import { CreateTrainerDTO } from './create-trainer.dto';

export class UpdateTrainerDTO extends PartialType(CreateTrainerDTO) {
    @ApiPropertyOptional({ enum: TrainerStatus })
    @IsOptional()
    @IsEnum(TrainerStatus)
    status: TrainerStatus;
}
