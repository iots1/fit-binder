import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseServiceOperations, FitBinderDatabases, LogsService } from '@lib/common';
import { ConfigService } from '@lib/config';

import { CreateAppointmentDTO } from '../dto/create-appointment.dto';
import { UpdateAppointmentDTO } from '../dto/update-appointment.dto';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentsService extends BaseServiceOperations<
    Appointment,
    CreateAppointmentDTO,
    UpdateAppointmentDTO
> {
    protected readonly allowedRelations: string[] = [];

    constructor(
        protected readonly logger: LogsService,
        configService: ConfigService,
        @InjectRepository(Appointment, FitBinderDatabases.APPOINTMENT)
        appointmentRepository: Repository<Appointment>,
    ) {
        super(appointmentRepository, {
            logging: {
                logger,
                serviceName: configService.get('APPOINTMENT_PREFIX_NAME'),
                serviceVersion: configService.get('APPOINTMENT_PREFIX_VERSION'),
            },
        });
    }
}
