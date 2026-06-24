import { Module } from '@nestjs/common';

import { CommonModule, FitBinderDatabases } from '@lib/common';
import { ConfigModule } from '@lib/config';
import { DatabaseModule } from '@lib/database';

import { AppointmentModule } from './modules/appointment/appointment.module';
import { SessionModule } from './modules/session/session.module';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule.registerAsync(FitBinderDatabases.APPOINTMENT),
        CommonModule,
        AppointmentModule,
        SessionModule,
    ],
})
export class AppointmentBcModule {}
