import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { AppointmentStatus } from '../enum/appointment-status.enum';
import { CreateAppointmentDTO } from './create-appointment.dto';

export class UpdateAppointmentDTO extends PartialType(CreateAppointmentDTO) {
    @ApiPropertyOptional({ enum: AppointmentStatus })
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus;
}
