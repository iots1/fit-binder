import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';

import { AppMicroservice } from '@lib/common/enum/app-microservice.enum';
import { LogModule } from '@lib/common/modules/log/log.module';
import { ConfigModule, ConfigService } from '@lib/config';

/**
 * Global shared module. Registers a TCP {@link ClientProxy} for every FitBinder
 * microservice (data-driven from {@link AppMicroservice}) plus the JWT module, so
 * any BC can inject another BC's client by its token, e.g.:
 *
 *   constructor(@Inject(AppMicroservice.Trainer.name) private trainer: ClientProxy) {}
 *
 * Connection host/port come from each service's env keys
 * (e.g. `TRAINER_BC_MODULE_MICROSERVICE_HOST` / `..._PORT`).
 */
@Global()
@Module({
    imports: [
        ConfigModule,
        LogModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('SECRET_KEY'),
                // Per-token lifetimes are set at sign time in AuthService.
                signOptions: { expiresIn: '15m' },
            }),
        }),
        ClientsModule.registerAsync(
            Object.values(AppMicroservice).map((service) => ({
                name: service.name,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService): ClientProvider => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>(service.hostEnv, 'localhost'),
                        port: configService.get<number>(service.portEnv),
                    },
                }),
            })),
        ),
    ],
    exports: [JwtModule, ClientsModule, ConfigModule, LogModule],
})
export class CommonModule {}
