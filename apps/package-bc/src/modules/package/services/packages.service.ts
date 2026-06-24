import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseServiceOperations, FitBinderDatabases, LogsService } from '@lib/common';
import { ConfigService } from '@lib/config';

import { CreatePackageDTO } from '../dto/create-package.dto';
import { UpdatePackageDTO } from '../dto/update-package.dto';
import { Package } from '../entities/package.entity';

@Injectable()
export class PackagesService extends BaseServiceOperations<
    Package,
    CreatePackageDTO,
    UpdatePackageDTO
> {
    protected readonly allowedRelations: string[] = [];

    constructor(
        protected readonly logger: LogsService,
        configService: ConfigService,
        @InjectRepository(Package, FitBinderDatabases.PACKAGE)
        packageRepository: Repository<Package>,
    ) {
        super(packageRepository, {
            logging: {
                logger,
                serviceName: configService.get('PACKAGE_PREFIX_NAME'),
                serviceVersion: configService.get('PACKAGE_PREFIX_VERSION'),
            },
        });
    }
}
