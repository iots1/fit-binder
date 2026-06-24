import { IntersectionType } from '@nestjs/swagger';

import { BaseResponseDTO } from '@lib/common';

import { CreateAppointmentDTO } from './create-appointment.dto';

export class AppointmentResponseDTO extends IntersectionType(
    CreateAppointmentDTO,
    BaseResponseDTO,
) {}
