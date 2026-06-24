import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import * as Joi from 'joi';

/**
 * Global configuration module. Loads `.env` from the repo root and validates it
 * against a single schema shared by every FitBinder microservice.
 */
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            validationSchema: Joi.object({
                // --- General ---
                NODE_ENV: Joi.string().valid('local', 'dev', 'staging', 'prod').default('dev'),
                LOG_LEVEL: Joi.string()
                    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent')
                    .default('info'),

                // --- Security ---
                SECRET_KEY: Joi.string().required(),
                JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
                JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
                CORS_ORIGIN: Joi.string().default('*'),
                RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
                RATE_LIMIT_MAX: Joi.number().default(10000),

                // --- Databases (one per Bounded Context) ---
                // Auth DB
                AUTH_DB_HOST: Joi.string().default('localhost'),
                AUTH_DB_PORT: Joi.number().default(5432),
                AUTH_DB_USERNAME: Joi.string().default('postgres'),
                AUTH_DB_PASSWORD: Joi.string().allow('').default('postgres'),
                AUTH_DB_NAME: Joi.string().default('fit_binder_auth'),
                AUTH_DB_SYNCHRONIZE: Joi.boolean().default(false),
                AUTH_DB_LOGGING: Joi.boolean().default(false),

                // Trainer DB
                TRAINER_DB_HOST: Joi.string().default('localhost'),
                TRAINER_DB_PORT: Joi.number().default(5432),
                TRAINER_DB_USERNAME: Joi.string().default('postgres'),
                TRAINER_DB_PASSWORD: Joi.string().allow('').default('postgres'),
                TRAINER_DB_NAME: Joi.string().default('fit_binder_trainer'),
                TRAINER_DB_SYNCHRONIZE: Joi.boolean().default(false),
                TRAINER_DB_LOGGING: Joi.boolean().default(false),

                // Trainee DB
                TRAINEE_DB_HOST: Joi.string().default('localhost'),
                TRAINEE_DB_PORT: Joi.number().default(5432),
                TRAINEE_DB_USERNAME: Joi.string().default('postgres'),
                TRAINEE_DB_PASSWORD: Joi.string().allow('').default('postgres'),
                TRAINEE_DB_NAME: Joi.string().default('fit_binder_trainee'),
                TRAINEE_DB_SYNCHRONIZE: Joi.boolean().default(false),
                TRAINEE_DB_LOGGING: Joi.boolean().default(false),

                // Package DB
                PACKAGE_DB_HOST: Joi.string().default('localhost'),
                PACKAGE_DB_PORT: Joi.number().default(5432),
                PACKAGE_DB_USERNAME: Joi.string().default('postgres'),
                PACKAGE_DB_PASSWORD: Joi.string().allow('').default('postgres'),
                PACKAGE_DB_NAME: Joi.string().default('fit_binder_package'),
                PACKAGE_DB_SYNCHRONIZE: Joi.boolean().default(false),
                PACKAGE_DB_LOGGING: Joi.boolean().default(false),

                // Appointment DB
                APPOINTMENT_DB_HOST: Joi.string().default('localhost'),
                APPOINTMENT_DB_PORT: Joi.number().default(5432),
                APPOINTMENT_DB_USERNAME: Joi.string().default('postgres'),
                APPOINTMENT_DB_PASSWORD: Joi.string().allow('').default('postgres'),
                APPOINTMENT_DB_NAME: Joi.string().default('fit_binder_appointment'),
                APPOINTMENT_DB_SYNCHRONIZE: Joi.boolean().default(false),
                APPOINTMENT_DB_LOGGING: Joi.boolean().default(false),

                // --- Auth service ---
                AUTH_PREFIX_NAME: Joi.string().default('auth'),
                AUTH_PREFIX_VERSION: Joi.string().default('v1'),
                AUTH_MODULE_HTTP_PORT: Joi.number().default(3001),
                AUTH_MODULE_MICROSERVICE_HOST: Joi.string().default('localhost'),
                AUTH_MODULE_MICROSERVICE_PORT: Joi.number().default(4001),

                // --- Trainer BC ---
                TRAINER_PREFIX_NAME: Joi.string().default('trainer'),
                TRAINER_PREFIX_VERSION: Joi.string().default('v1'),
                TRAINER_BC_MODULE_HTTP_PORT: Joi.number().default(3002),
                TRAINER_BC_MODULE_MICROSERVICE_HOST: Joi.string().default('localhost'),
                TRAINER_BC_MODULE_MICROSERVICE_PORT: Joi.number().default(4002),

                // --- Trainee BC ---
                TRAINEE_PREFIX_NAME: Joi.string().default('trainee'),
                TRAINEE_PREFIX_VERSION: Joi.string().default('v1'),
                TRAINEE_BC_MODULE_HTTP_PORT: Joi.number().default(3003),
                TRAINEE_BC_MODULE_MICROSERVICE_HOST: Joi.string().default('localhost'),
                TRAINEE_BC_MODULE_MICROSERVICE_PORT: Joi.number().default(4003),

                // --- Package BC ---
                PACKAGE_PREFIX_NAME: Joi.string().default('package'),
                PACKAGE_PREFIX_VERSION: Joi.string().default('v1'),
                PACKAGE_BC_MODULE_HTTP_PORT: Joi.number().default(3004),
                PACKAGE_BC_MODULE_MICROSERVICE_HOST: Joi.string().default('localhost'),
                PACKAGE_BC_MODULE_MICROSERVICE_PORT: Joi.number().default(4004),

                // --- Appointment BC ---
                APPOINTMENT_PREFIX_NAME: Joi.string().default('appointment'),
                APPOINTMENT_PREFIX_VERSION: Joi.string().default('v1'),
                APPOINTMENT_BC_MODULE_HTTP_PORT: Joi.number().default(3005),
                APPOINTMENT_BC_MODULE_MICROSERVICE_HOST: Joi.string().default('localhost'),
                APPOINTMENT_BC_MODULE_MICROSERVICE_PORT: Joi.number().default(4005),
            }),
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
        }),
    ],
})
export class ConfigModule {}
