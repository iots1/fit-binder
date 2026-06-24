import { Module } from '@nestjs/common';

import { CommonModule, FitBinderDatabases } from '@lib/common';
import { ConfigModule } from '@lib/config';
import { DatabaseModule } from '@lib/database';

import { PackageModule } from './modules/package/package.module';
import { PurchaseModule } from './modules/purchase/purchase.module';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule.registerAsync(FitBinderDatabases.PACKAGE),
        CommonModule,
        PackageModule,
        PurchaseModule,
    ],
})
export class PackageBcModule {}
