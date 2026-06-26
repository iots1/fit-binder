import { Transport } from '@nestjs/microservices';

/**
 * Registry of TCP microservice clients in the FitBinder platform.
 * Each entry's `name` is the DI token used to inject a ClientProxy, and the
 * host/port/transport are the single source of truth for all client registrations.
 */
export const AppMicroservice = {
    Auth: {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        hostEnv: 'AUTH_MODULE_MICROSERVICE_HOST',
        portEnv: 'AUTH_MODULE_MICROSERVICE_PORT',
    },
    Trainer: {
        name: 'TRAINER_SERVICE',
        transport: Transport.TCP,
        hostEnv: 'TRAINER_BC_MODULE_MICROSERVICE_HOST',
        portEnv: 'TRAINER_BC_MODULE_MICROSERVICE_PORT',
    },
    Trainee: {
        name: 'TRAINEE_SERVICE',
        transport: Transport.TCP,
        hostEnv: 'TRAINEE_BC_MODULE_MICROSERVICE_HOST',
        portEnv: 'TRAINEE_BC_MODULE_MICROSERVICE_PORT',
    },
    Package: {
        name: 'PACKAGE_SERVICE',
        transport: Transport.TCP,
        hostEnv: 'PACKAGE_BC_MODULE_MICROSERVICE_HOST',
        portEnv: 'PACKAGE_BC_MODULE_MICROSERVICE_PORT',
    },
    Appointment: {
        name: 'APPOINTMENT_SERVICE',
        transport: Transport.TCP,
        hostEnv: 'APPOINTMENT_BC_MODULE_MICROSERVICE_HOST',
        portEnv: 'APPOINTMENT_BC_MODULE_MICROSERVICE_PORT',
    },
} as const;

export type AppMicroserviceKey = keyof typeof AppMicroservice;
