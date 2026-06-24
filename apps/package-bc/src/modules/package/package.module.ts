import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases, LogModule } from '@lib/common';

import { PackagesController } from './controllers/packages.controller';
import { Package } from './entities/package.entity';
import { PackagesService } from './services/packages.service';

@Module({
    imports: [TypeOrmModule.forFeature([Package], FitBinderDatabases.PACKAGE), LogModule],
    controllers: [PackagesController],
    providers: [PackagesService],
    exports: [PackagesService],
})
export class PackageModule {}
