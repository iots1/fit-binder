import { bootstrapApplication } from '@lib/common';

import { AppointmentBcModule } from './appointment-bc.module';

async function bootstrap(): Promise<void> {
    await bootstrapApplication({
        module: AppointmentBcModule,
        globalPrefixNameEnv: 'APPOINTMENT_PREFIX_NAME',
        globalPrefixVersionEnv: 'APPOINTMENT_PREFIX_VERSION',
        defaultGlobalPrefixName: 'appointment',
        defaultGlobalPrefixVersion: 'v1',
        httpPortEnv: 'APPOINTMENT_BC_MODULE_HTTP_PORT',
        microservicePortEnv: 'APPOINTMENT_BC_MODULE_MICROSERVICE_PORT',
        swagger: {
            title: 'Appointment API',
            description: 'Manages trainer–trainee appointments and training session history.',
            tag: 'appointment-bc',
        },
        jwtAuth: { name: 'access-token' },
    });
}

void bootstrap();
