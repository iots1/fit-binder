import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseServiceOperations, FitBinderDatabases, LogsService } from '@lib/common';
import { ConfigService } from '@lib/config';

import { CreateTraineeDTO } from '../dto/create-trainee.dto';
import { UpdateTraineeDTO } from '../dto/update-trainee.dto';
import { Trainee } from '../entities/trainee.entity';

@Injectable()
export class TraineesService extends BaseServiceOperations<
    Trainee,
    CreateTraineeDTO,
    UpdateTraineeDTO
> {
    protected readonly allowedRelations: string[] = [];

    constructor(
        protected readonly logger: LogsService,
        configService: ConfigService,
        @InjectRepository(Trainee, FitBinderDatabases.TRAINEE)
        traineeRepository: Repository<Trainee>,
    ) {
        super(traineeRepository, {
            logging: {
                logger,
                serviceName: configService.get('TRAINEE_PREFIX_NAME'),
                serviceVersion: configService.get('TRAINEE_PREFIX_VERSION'),
            },
        });
    }
}
