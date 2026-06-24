import { bootstrapApplication } from '@lib/common';

import { TraineeBcModule } from './trainee-bc.module';

async function bootstrap(): Promise<void> {
    await bootstrapApplication({
        module: TraineeBcModule,
        globalPrefixNameEnv: 'TRAINEE_PREFIX_NAME',
        globalPrefixVersionEnv: 'TRAINEE_PREFIX_VERSION',
        defaultGlobalPrefixName: 'trainee',
        defaultGlobalPrefixVersion: 'v1',
        httpPortEnv: 'TRAINEE_BC_MODULE_HTTP_PORT',
        microservicePortEnv: 'TRAINEE_BC_MODULE_MICROSERVICE_PORT',
        swagger: {
            title: 'Trainee API',
            description: 'Manages trainees, their profiles and health records.',
            tag: 'trainee-bc',
        },
        jwtAuth: { name: 'access-token' },
    });
}

void bootstrap();
