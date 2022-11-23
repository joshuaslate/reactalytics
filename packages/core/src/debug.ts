import { AnalyticsClient } from './analytics-client';
import { ErrorClient, ErrorLogLevel } from './error-client';

export class DebugAnalyticsClient extends AnalyticsClient {
  readonly clientName = 'debug_analytics';

  constructor() {
    super();
  }

  identifyUser<U = {}>(id: string, otherInfo?: U): void {
    console.log('identified user', id, otherInfo);
  }

  page<T = {}>(page: string, properties: T): void {
    console.log('page view', page, properties);
  }

  sendEvent<T = {}>(event: string, properties: T): void {
    console.log('event', event, properties);
  }
}

export class DebugErrorClient extends ErrorClient {
  readonly clientName = 'debug_error';

  constructor() {
    super();
  }

  identifyUser<U = {}>(id: string, otherInfo?: U): void {
    console.log('identified user', id, otherInfo);
  }

  trackError<T = []>(
    error: string,
    properties: T,
    level: ErrorLogLevel = 'error',
  ): void {
    const args = [`error:${level}`, error, properties];

    switch (level) {
      case 'log':
        console.log(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      default:
        console.error(...args);
        break;
    }
  }
}
