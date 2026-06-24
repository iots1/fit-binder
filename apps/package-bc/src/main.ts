import { bootstrapApplication } from '@lib/common';

import { PackageBcModule } from './package-bc.module';

async function bootstrap(): Promise<void> {
    await bootstrapApplication({
        module: PackageBcModule,
        globalPrefixNameEnv: 'PACKAGE_PREFIX_NAME',
        globalPrefixVersionEnv: 'PACKAGE_PREFIX_VERSION',
        defaultGlobalPrefixName: 'package',
        defaultGlobalPrefixVersion: 'v1',
        httpPortEnv: 'PACKAGE_BC_MODULE_HTTP_PORT',
        microservicePortEnv: 'PACKAGE_BC_MODULE_MICROSERVICE_PORT',
        swagger: {
            title: 'Package API',
            description: 'Manages training packages, pricing and trainee purchases.',
            tag: 'package-bc',
        },
        jwtAuth: { name: 'access-token' },
    });
}

void bootstrap();
