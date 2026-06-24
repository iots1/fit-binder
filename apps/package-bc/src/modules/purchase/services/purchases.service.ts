import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseServiceOperations, FitBinderDatabases, LogsService } from '@lib/common';
import { ConfigService } from '@lib/config';

import { CreatePurchaseDTO } from '../dto/create-purchase.dto';
import { UpdatePurchaseDTO } from '../dto/update-purchase.dto';
import { Purchase } from '../entities/purchase.entity';

@Injectable()
export class PurchasesService extends BaseServiceOperations<
    Purchase,
    CreatePurchaseDTO,
    UpdatePurchaseDTO
> {
    protected readonly allowedRelations: string[] = [];

    constructor(
        protected readonly logger: LogsService,
        configService: ConfigService,
        @InjectRepository(Purchase, FitBinderDatabases.PACKAGE)
        purchaseRepository: Repository<Purchase>,
    ) {
        super(purchaseRepository, {
            logging: {
                logger,
                serviceName: configService.get('PACKAGE_PREFIX_NAME'),
                serviceVersion: configService.get('PACKAGE_PREFIX_VERSION'),
            },
        });
    }
}
