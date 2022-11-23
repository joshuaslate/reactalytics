import { ErrorClient, ErrorLogLevel } from '@reactalytics/core';
import * as Sentry from '@sentry/react';
import { User } from '@sentry/types';

const buildException = (
  message: string,
  errorInfo: Array<Error> | undefined,
): Array<Error> => {
  if (!errorInfo?.length) {
    return [new Error(message)];
  }

  return errorInfo;
};

const convertLogLevel = (logLevel: ErrorLogLevel): Sentry.SeverityLevel => {
  switch (logLevel) {
    case 'log':
    case 'info':
    case 'debug':
    case 'error':
      return logLevel;
    case 'warn':
      return 'warning';
    case 'critical':
      return 'fatal';
  }
};

export class SentryClient extends ErrorClient {
  readonly clientName = 'sentry';
  private providedSentryHub: Sentry.Hub;

  private getHub() {
    return this.providedSentryHub || Sentry.getCurrentHub();
  }

  constructor(sentryHub?: Sentry.Hub) {
    super();

    this.providedSentryHub = sentryHub;
  }

  identifyUser<U = User>(id: string, otherInfo?: U): void {
    const hub = this.getHub();

    hub.setUser({
      id,
      ...otherInfo,
    });
  }

  trackError<T = Error>(
    message: string,
    errorInfo?: Array<T>,
    level?: ErrorLogLevel,
  ): void {
    const hub = this.getHub();
    const exceptionsToSend = buildException(message, errorInfo as Array<Error>);

    exceptionsToSend.forEach((exception) => {
      if (level) {
        hub.withScope((scope) => {
          scope.setLevel(convertLogLevel(level));

          hub.captureException(exception);
        });
      } else {
        hub.captureException(exception);
      }
    });
  }
}
