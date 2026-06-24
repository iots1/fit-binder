import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseServiceOperations, FitBinderDatabases, LogsService } from '@lib/common';
import { ConfigService } from '@lib/config';

import { CreateHealthRecordDTO } from '../dto/create-health-record.dto';
import { UpdateHealthRecordDTO } from '../dto/update-health-record.dto';
import { HealthRecord } from '../entities/health-record.entity';

@Injectable()
export class HealthRecordsService extends BaseServiceOperations<
    HealthRecord,
    CreateHealthRecordDTO,
    UpdateHealthRecordDTO
> {
    protected readonly allowedRelations: string[] = [];

    constructor(
        protected readonly logger: LogsService,
        configService: ConfigService,
        @InjectRepository(HealthRecord, FitBinderDatabases.TRAINEE)
        healthRecordRepository: Repository<HealthRecord>,
    ) {
        super(healthRecordRepository, {
            logging: {
                logger,
                serviceName: configService.get('TRAINEE_PREFIX_NAME'),
                serviceVersion: configService.get('TRAINEE_PREFIX_VERSION'),
            },
        });
    }
}
