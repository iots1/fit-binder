import { Module } from '@nestjs/common';

import { CommonModule, FitBinderDatabases } from '@lib/common';
import { ConfigModule } from '@lib/config';
import { DatabaseModule } from '@lib/database';

import { AuthFeatureModule } from './modules/auth/auth.module';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule.registerAsync(FitBinderDatabases.AUTH),
        CommonModule,
        AuthFeatureModule,
    ],
})
export class AuthModule {}
