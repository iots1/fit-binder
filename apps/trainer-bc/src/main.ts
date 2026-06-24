import { bootstrapApplication } from '@lib/common';

import { TrainerBcModule } from './trainer-bc.module';

async function bootstrap(): Promise<void> {
    await bootstrapApplication({
        module: TrainerBcModule,
        globalPrefixNameEnv: 'TRAINER_PREFIX_NAME',
        globalPrefixVersionEnv: 'TRAINER_PREFIX_VERSION',
        defaultGlobalPrefixName: 'trainer',
        defaultGlobalPrefixVersion: 'v1',
        httpPortEnv: 'TRAINER_BC_MODULE_HTTP_PORT',
        microservicePortEnv: 'TRAINER_BC_MODULE_MICROSERVICE_PORT',
        swagger: {
            title: 'Trainer API',
            description: 'Manages trainers, their profiles and specialties.',
            tag: 'trainer-bc',
        },
        jwtAuth: { name: 'access-token' },
    });
}

void bootstrap();
