import { ICallContext, ILogData } from '@lib/common/modules/log/interfaces/log-context.interface';

export abstract class Logger {
    abstract info(logData: ILogData): void;
    abstract warn(logData: ILogData): void;
    abstract error(message: string, error?: Error, context?: Record<string, any>): void;
    abstract debug(logData: ILogData): void;
    abstract setContext(serviceName: string, serviceVersion: string): void;
    abstract setContextFromPayload(context: ICallContext): void;
}
