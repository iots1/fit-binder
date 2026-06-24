import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseServiceOperations, FitBinderDatabases, LogsService } from '@lib/common';
import { ConfigService } from '@lib/config';

import { CreateTrainerDTO } from '../dto/create-trainer.dto';
import { UpdateTrainerDTO } from '../dto/update-trainer.dto';
import { Trainer } from '../entities/trainer.entity';

@Injectable()
export class TrainersService extends BaseServiceOperations<
    Trainer,
    CreateTrainerDTO,
    UpdateTrainerDTO
> {
    protected readonly allowedRelations: string[] = [];

    constructor(
        protected readonly logger: LogsService,
        // Not `private readonly` — used only inside super()
        configService: ConfigService,
        @InjectRepository(Trainer, FitBinderDatabases.TRAINER)
        trainerRepository: Repository<Trainer>,
    ) {
        super(trainerRepository, {
            logging: {
                logger,
                serviceName: configService.get('TRAINER_PREFIX_NAME'),
                serviceVersion: configService.get('TRAINER_PREFIX_VERSION'),
            },
        });
    }
}
