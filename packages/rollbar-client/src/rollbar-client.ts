import { ErrorClient, ErrorLogLevel } from '@reactalytics/core';
import Rollbar, { LogArgument, Payload } from 'rollbar';

export class RollbarClient extends ErrorClient {
  readonly clientName = 'rollbar';

  private rollbarInstance: Rollbar;

  constructor(rollbarInstance: Rollbar) {
    super();
    this.rollbarInstance = rollbarInstance;
  }

  identifyUser<U extends object | undefined = Payload['person']>(
    id: string,
    otherInfo?: U,
  ): void {
    this.rollbarInstance.configure({
      payload: { person: { id, ...otherInfo } },
    });
  }

  trackError<T extends object | Error | string | undefined = LogArgument>(
    message: string,
    errorInfo?: Array<T>,
    level?: ErrorLogLevel,
  ): void {
    switch (level) {
      case 'log':
        this.rollbarInstance.log(message, ...(errorInfo || []));
        break;
      case 'debug':
        this.rollbarInstance.debug(message, ...(errorInfo || []));
        break;
      case 'info':
        this.rollbarInstance.info(message, ...(errorInfo || []));
        break;
      case 'warn':
        this.rollbarInstance.warn(message, ...(errorInfo || []));
        break;
      case 'critical':
        this.rollbarInstance.critical(message, ...(errorInfo || []));
        break;
      case 'error':
      default:
        this.rollbarInstance.error(message, ...(errorInfo || []));
        break;
    }
  }
}
