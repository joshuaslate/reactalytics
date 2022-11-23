import { AnalyticsBrowser, Options, Traits } from '@segment/analytics-next';
import { AnalyticsClient } from '@reactalytics/core';

export interface SegmentClientPageParams extends Record<string, any> {
  category?: string;
}

export class SegmentClient extends AnalyticsClient {
  readonly clientName = 'segment';
  private readonly segmentClient: AnalyticsBrowser;
  private readonly options: Options;

  constructor(segmentClient: AnalyticsBrowser, options?: Options) {
    super();

    this.segmentClient = segmentClient;
    this.options = options;
  }

  identifyUser<U extends object | undefined = Traits>(
    id: string,
    otherInfo?: U,
  ): void {
    this.segmentClient.identify(id, otherInfo, this.options || {});
  }

  page<T extends object | undefined = SegmentClientPageParams>(
    page: string,
    properties: T,
  ): void {
    const { category = '', ...rest } = (properties ||
      {}) as SegmentClientPageParams;

    this.segmentClient.page(category, page, rest, this.options || {});
  }

  sendEvent<T extends object | undefined>(event: string, properties: T): void {
    this.segmentClient.track(event, properties, this.options || {});
  }
}
