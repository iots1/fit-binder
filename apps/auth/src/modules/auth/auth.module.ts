import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FitBinderDatabases } from '@lib/common';

import { AuthController } from './controllers/auth.controller';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';

@Module({
    imports: [TypeOrmModule.forFeature([User], FitBinderDatabases.AUTH)],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthFeatureModule {}
