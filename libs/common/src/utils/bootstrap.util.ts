import { ClassSerializerInterceptor, Type, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { apiReference } from '@scalar/nestjs-api-reference';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AllExceptionsFilter } from '@lib/common/utils/http-exception/all-exceptions-filter.util';
import { RpcExceptionsFilter } from '@lib/common/utils/http-exception/rpc-exceptions-filter.util';
import { ValidationException } from '@lib/common/utils/http-exception/validation.exception';
import { flattenValidationErrors } from '@lib/common/utils/http-exception/validation.helper';
import { TransformInterceptor } from '@lib/common/utils/http-success/transform-interceptor.util';

// ──────────────────────────────────────────────────────────────
//  Options
// ──────────────────────────────────────────────────────────────

export interface JwtAuthOptions {
    name: string;
    description?: string;
}

export interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string;
}

export interface SecurityOptions {
    helmet?: boolean;
    rateLimit?: RateLimitOptions | false;
    cors?: { origin?: string | string[] };
}

export interface BootstrapOptions {
    module: Type<unknown>;
    /** Env key holding the URL prefix name (e.g. 'trainer'). */
    globalPrefixNameEnv: string;
    /** Env key holding the URL prefix version (e.g. 'v1'). */
    globalPrefixVersionEnv: string;
    defaultGlobalPrefixName: string;
    defaultGlobalPrefixVersion: string;
    httpPortEnv: string;
    /** When set, a TCP microservice listener is started on this env's port. */
    microservicePortEnv?: string;
    swagger: {
        title: string;
        description: string;
        version?: string;
        tag: string;
    };
    jwtAuth?: JwtAuthOptions;
    security?: SecurityOptions;
    /** Reject unknown payload fields with 400 (default: false → strip them). */
    forbidNonWhitelisted?: boolean;
}

// ──────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────

function initializeTimezone(): void {
    process.env.TZ = 'Asia/Bangkok';
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.tz.setDefault('Asia/Bangkok');
}

async function applySecurity(
    app: NestFastifyApplication,
    configService: ConfigService,
    security?: SecurityOptions,
): Promise<void> {
    const corsOrigin = security?.cors?.origin ?? configService.get<string>('CORS_ORIGIN') ?? '*';
    app.enableCors({ origin: corsOrigin });

    if (security?.helmet !== false) {
        await app.register(fastifyHelmet, { contentSecurityPolicy: false });
    }

    if (security?.rateLimit !== false) {
        const opts = security?.rateLimit ?? {};
        await app.register(fastifyRateLimit, {
            max: configService.get<number>('RATE_LIMIT_MAX') ?? opts.max ?? 10000,
            timeWindow:
                configService.get<number>('RATE_LIMIT_WINDOW_MS') ??
                opts.windowMs ??
                15 * 60 * 1000,
            errorResponseBuilder: () => ({
                status: { code: 429, message: 'Too Many Requests' },
                errors: [
                    {
                        code: 'TOO_MANY_REQUESTS',
                        title: 'Too Many Requests',
                        detail: opts.message ?? 'Too many requests, please try again later.',
                    },
                ],
                meta: { timestamp: new Date().toISOString() },
            }),
        });
    }
}

function registerGlobalMiddleware(
    app: NestFastifyApplication,
    reflector: Reflector,
    forbidNonWhitelisted: boolean,
): void {
    app.useGlobalFilters(new RpcExceptionsFilter(), new AllExceptionsFilter());

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(reflector),
        new TransformInterceptor(reflector),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted,
            stopAtFirstError: false,
            transformOptions: { enableImplicitConversion: false },
            exceptionFactory: (errors: ValidationError[]): never => {
                throw new ValidationException(flattenValidationErrors(errors));
            },
        }),
    );
}

function setupApiDocs(
    app: NestFastifyApplication,
    options: BootstrapOptions,
    pathURI: string,
): { fullDocsPath: string; classicDocsPath: string } {
    const builder = new DocumentBuilder()
        .setTitle(options.swagger.title)
        .setDescription(options.swagger.description)
        .setVersion(options.swagger.version ?? '1.0')
        .addTag(options.swagger.tag);

    if (options.jwtAuth) {
        builder.addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'access-token',
                description: options.jwtAuth.description ?? 'Enter JWT token',
                in: 'header',
            },
            options.jwtAuth.name,
        );
        builder.addSecurityRequirements(options.jwtAuth.name);
    }

    const document = SwaggerModule.createDocument(app, builder.build());

    const fullDocsPath = `/${pathURI}/api-docs`;
    const jsonDocsPath = `/${pathURI}/json-docs`;
    const classicDocsPath = `/${pathURI}/classic-docs`;

    app.use(
        fullDocsPath,
        apiReference({
            url: jsonDocsPath,
            persistAuth: true,
            showSidebar: true,
            searchHotKey: 'k',
        }),
    );

    SwaggerModule.setup(classicDocsPath, app, document, {
        customSiteTitle: options.swagger.title,
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    });

    app.getHttpAdapter().get(jsonDocsPath, (_req: FastifyRequest, reply: FastifyReply) => {
        void reply.header('Content-Type', 'application/json').send(document);
    });

    return { fullDocsPath, classicDocsPath };
}

function registerHealthCheck(
    app: NestFastifyApplication,
    pathURI: string,
    moduleName: string,
): void {
    app.getHttpAdapter().get(`/${pathURI}/health`, (_req: FastifyRequest, reply: FastifyReply) => {
        void reply.status(200).send({
            status: 'ok',
            message: `Service ${moduleName} is running`,
            timestamp: new Date().toISOString(),
        });
    });
}

async function setupMicroservice(
    app: NestFastifyApplication,
    configService: ConfigService,
    moduleName: string,
    microservicePortEnv: string,
): Promise<void> {
    const portFromEnv = configService.get<string | number | undefined>(microservicePortEnv);
    const port = Number(portFromEnv);

    if (portFromEnv === undefined || Number.isNaN(port)) {
        throw new Error(
            `[${moduleName}] Microservice port env '${microservicePortEnv}' is not set or invalid.`,
        );
    }

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: { port, host: '0.0.0.0' },
    });
    await app.startAllMicroservices();
    console.log(`🚀 [${moduleName}] Microservice (TCP) listening on port ${port}`);
}

function resolveHttpPort(configService: ConfigService, httpPortEnv: string): number {
    const port = Number(configService.get<number>(httpPortEnv));
    if (Number.isNaN(port)) {
        throw new Error(`HTTP port env '${httpPortEnv}' is not defined.`);
    }
    return port;
}

// ──────────────────────────────────────────────────────────────
//  Main Bootstrap
// ──────────────────────────────────────────────────────────────

export async function bootstrapApplication(
    options: BootstrapOptions,
): Promise<NestFastifyApplication> {
    initializeTimezone();

    const adapter = new FastifyAdapter({ trustProxy: true, logger: false });
    const app = await NestFactory.create<NestFastifyApplication>(options.module, adapter, {
        rawBody: true,
    });
    const configService = app.get(ConfigService);
    const reflector = app.get(Reflector);
    const moduleName = (options.module as { name: string }).name;

    await applySecurity(app, configService, options.security);

    const listenPORT = resolveHttpPort(configService, options.httpPortEnv);
    const globalPrefixName =
        configService.get<string>(options.globalPrefixNameEnv) ?? options.defaultGlobalPrefixName;
    const globalPrefixVersion =
        configService.get<string>(options.globalPrefixVersionEnv) ??
        options.defaultGlobalPrefixVersion;
    const pathURI = `${globalPrefixName}/${globalPrefixVersion}`;
    app.setGlobalPrefix(pathURI);

    registerGlobalMiddleware(app, reflector, options.forbidNonWhitelisted ?? false);

    const { fullDocsPath, classicDocsPath } = setupApiDocs(app, options, pathURI);
    registerHealthCheck(app, pathURI, moduleName);

    if (options.microservicePortEnv !== undefined) {
        await setupMicroservice(app, configService, moduleName, options.microservicePortEnv);
    }

    await app.listen(listenPORT, '0.0.0.0');

    console.log(`🚀 [${moduleName}] HTTP running on: http://localhost:${listenPORT}/${pathURI}`);
    console.log(
        `📄 [${moduleName}] API Docs (Scalar): http://localhost:${listenPORT}${fullDocsPath}`,
    );
    console.log(
        `📄 [${moduleName}] API Docs (Swagger): http://localhost:${listenPORT}${classicDocsPath}`,
    );

    return app;
}
