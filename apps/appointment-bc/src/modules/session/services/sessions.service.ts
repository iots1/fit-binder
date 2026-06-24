import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseServiceOperations, FitBinderDatabases, LogsService } from '@lib/common';
import { ConfigService } from '@lib/config';

import { CreateSessionDTO } from '../dto/create-session.dto';
import { UpdateSessionDTO } from '../dto/update-session.dto';
import { TrainingSession } from '../entities/session.entity';

@Injectable()
export class SessionsService extends BaseServiceOperations<
    TrainingSession,
    CreateSessionDTO,
    UpdateSessionDTO
> {
    protected readonly allowedRelations: string[] = [];

    constructor(
        protected readonly logger: LogsService,
        configService: ConfigService,
        @InjectRepository(TrainingSession, FitBinderDatabases.APPOINTMENT)
        sessionRepository: Repository<TrainingSession>,
    ) {
        super(sessionRepository, {
            logging: {
                logger,
                serviceName: configService.get('APPOINTMENT_PREFIX_NAME'),
                serviceVersion: configService.get('APPOINTMENT_PREFIX_VERSION'),
            },
        });
    }
}
