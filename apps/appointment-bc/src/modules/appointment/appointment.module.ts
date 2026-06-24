import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases, LogModule } from '@lib/common';

import { AppointmentsController } from './controllers/appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsService } from './services/appointments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Appointment], FitBinderDatabases.APPOINTMENT), LogModule],
    controllers: [AppointmentsController],
    providers: [AppointmentsService],
    exports: [AppointmentsService],
})
export class AppointmentModule {}
