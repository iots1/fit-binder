import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases, LogModule } from '@lib/common';

import { TraineesController } from './controllers/trainees.controller';
import { Trainee } from './entities/trainee.entity';
import { TraineesService } from './services/trainees.service';

@Module({
    imports: [TypeOrmModule.forFeature([Trainee], FitBinderDatabases.TRAINEE), LogModule],
    controllers: [TraineesController],
    providers: [TraineesService],
    exports: [TraineesService],
})
export class TraineeModule {}
