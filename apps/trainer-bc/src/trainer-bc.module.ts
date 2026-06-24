import { Module } from '@nestjs/common';

import { CommonModule, FitBinderDatabases } from '@lib/common';
import { ConfigModule } from '@lib/config';
import { DatabaseModule } from '@lib/database';

import { TrainerModule } from './modules/trainer/trainer.module';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule.registerAsync(FitBinderDatabases.TRAINER),
        CommonModule,
        TrainerModule,
    ],
})
export class TrainerBcModule {}
