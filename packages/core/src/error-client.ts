export type ErrorLogLevel =
  | 'log'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'critical';

export abstract class ErrorClient {
  readonly clientType = 'error';
  readonly clientName: string;
  abstract identifyUser<U extends Object = undefined>(
    id: string,
    otherInfo?: U,
  ): void;
  abstract trackError<T extends Object | Error | undefined = undefined>(
    message: string,
    errorInfo?: Array<T>,
    level?: ErrorLogLevel,
  ): void;
}
