import { bootstrapApplication } from '@lib/common';

import { AuthModule } from './auth.module';

async function bootstrap(): Promise<void> {
    await bootstrapApplication({
        module: AuthModule,
        globalPrefixNameEnv: 'AUTH_PREFIX_NAME',
        globalPrefixVersionEnv: 'AUTH_PREFIX_VERSION',
        defaultGlobalPrefixName: 'auth',
        defaultGlobalPrefixVersion: 'v1',
        httpPortEnv: 'AUTH_MODULE_HTTP_PORT',
        microservicePortEnv: 'AUTH_MODULE_MICROSERVICE_PORT',
        swagger: {
            title: 'Auth API',
            description: 'Authentication & identity for FitBinder.',
            tag: 'auth',
        },
        jwtAuth: { name: 'access-token' },
    });
}

void bootstrap();
