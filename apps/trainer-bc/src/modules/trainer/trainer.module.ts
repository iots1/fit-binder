import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases, LogModule } from '@lib/common';

import { TrainersController } from './controllers/trainers.controller';
import { Trainer } from './entities/trainer.entity';
import { TrainersService } from './services/trainers.service';

@Module({
    imports: [TypeOrmModule.forFeature([Trainer], FitBinderDatabases.TRAINER), LogModule],
    controllers: [TrainersController],
    providers: [TrainersService],
    exports: [TrainersService],
})
export class TrainerModule {}
