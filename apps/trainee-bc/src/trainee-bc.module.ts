import { Module } from '@nestjs/common';

import { CommonModule, FitBinderDatabases } from '@lib/common';
import { ConfigModule } from '@lib/config';
import { DatabaseModule } from '@lib/database';

import { HealthRecordModule } from './modules/health-record/health-record.module';
import { TraineeModule } from './modules/trainee/trainee.module';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule.registerAsync(FitBinderDatabases.TRAINEE),
        CommonModule,
        TraineeModule,
        HealthRecordModule,
    ],
})
export class TraineeBcModule {}
