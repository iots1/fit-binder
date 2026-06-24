import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases, LogModule } from '@lib/common';

import { SessionsController } from './controllers/sessions.controller';
import { TrainingSession } from './entities/session.entity';
import { SessionsService } from './services/sessions.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([TrainingSession], FitBinderDatabases.APPOINTMENT),
        LogModule,
    ],
    controllers: [SessionsController],
    providers: [SessionsService],
    exports: [SessionsService],
})
export class SessionModule {}
