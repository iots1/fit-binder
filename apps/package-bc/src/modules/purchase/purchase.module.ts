import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases, LogModule } from '@lib/common';

import { PurchasesController } from './controllers/purchases.controller';
import { Purchase } from './entities/purchase.entity';
import { PurchasesService } from './services/purchases.service';

@Module({
    imports: [TypeOrmModule.forFeature([Purchase], FitBinderDatabases.PACKAGE), LogModule],
    controllers: [PurchasesController],
    providers: [PurchasesService],
    exports: [PurchasesService],
})
export class PurchaseModule {}
