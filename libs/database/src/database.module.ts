import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FIT_BINDER_DB_ENV_PREFIX, FitBinderDatabases } from '@lib/common';
import { ConfigModule } from '@lib/config';

/**
 * Database module providing one PostgreSQL connection per Bounded Context.
 *
 * Each BC owns its own database and registers only that connection:
 *   imports: [DatabaseModule.registerAsync(FitBinderDatabases.TRAINER)]
 *
 * The connection name equals the {@link FitBinderDatabases} value, so
 * `TypeOrmModule.forFeature([Entity], FitBinderDatabases.TRAINER)` and
 * `@InjectRepository(Entity, FitBinderDatabases.TRAINER)` resolve the right
 * connection. Connection settings are read from the BC's env prefix
 * (e.g. `TRAINER_DB_HOST`, `TRAINER_DB_PORT`, `TRAINER_DB_NAME`).
 */
@Module({})
export class DatabaseModule {
    static registerAsync(connectionName: FitBinderDatabases): DynamicModule {
        const prefix = FIT_BINDER_DB_ENV_PREFIX[connectionName];

        return {
            module: DatabaseModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    name: connectionName,
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => ({
                        type: 'postgres',
                        host: configService.get<string>(`${prefix}_HOST`),
                        port: configService.get<number>(`${prefix}_PORT`),
                        username: configService.get<string>(`${prefix}_USERNAME`),
                        password: configService.get<string>(`${prefix}_PASSWORD`),
                        database: configService.get<string>(`${prefix}_NAME`) ?? connectionName,
                        autoLoadEntities: true,
                        synchronize: configService.get<boolean>(`${prefix}_SYNCHRONIZE`) ?? false,
                        logging: configService.get<boolean>(`${prefix}_LOGGING`) ?? false,
                        timezone: 'Z',
                        extra: {
                            max: 5,
                            min: 1,
                            idleTimeoutMillis: 30000,
                            connectionTimeoutMillis: 2000,
                        },
                    }),
                }),
            ],
            exports: [TypeOrmModule],
        };
    }
}
