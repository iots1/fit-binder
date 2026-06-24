import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { TraineeStatus } from '../enum/trainee-status.enum';
import { CreateTraineeDTO } from './create-trainee.dto';

export class UpdateTraineeDTO extends PartialType(CreateTraineeDTO) {
    @ApiPropertyOptional({ enum: TraineeStatus })
    @IsOptional()
    @IsEnum(TraineeStatus)
    status: TraineeStatus;
}
