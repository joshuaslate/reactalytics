export abstract class AnalyticsClient {
  readonly clientType = 'analytics';
  readonly clientName: string;
  abstract identifyUser<U extends Object = undefined>(
    id: string,
    otherInfo?: U,
  ): void;
  abstract page<T extends Object | undefined>(
    page: string,
    properties: T,
  ): void;
  abstract sendEvent<T extends Object | undefined>(
    event: string,
    properties: T,
  ): void;
}
