import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases, LogModule } from '@lib/common';

import { HealthRecordsController } from './controllers/health-records.controller';
import { HealthRecord } from './entities/health-record.entity';
import { HealthRecordsService } from './services/health-records.service';

@Module({
    imports: [TypeOrmModule.forFeature([HealthRecord], FitBinderDatabases.TRAINEE), LogModule],
    controllers: [HealthRecordsController],
    providers: [HealthRecordsService],
    exports: [HealthRecordsService],
})
export class HealthRecordModule {}
