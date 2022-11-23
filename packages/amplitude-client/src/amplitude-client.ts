import { AnalyticsClient } from '@reactalytics/core';
import * as client from '@amplitude/analytics-browser';
import type { ValidPropertyType } from '@amplitude/analytics-types';

export interface AmplitudeClientOptions {
  includeBasePageViewData?: boolean;
}

export const getBasePageData = (
  page: string,
  includeBasePageViewData: boolean | undefined,
) =>
  includeBasePageViewData
    ? {
        page_domain:
          (typeof window !== undefined &&
            typeof window.location !== 'undefined' &&
            window.location.hostname) ||
          '',
        page_location:
          (typeof window !== undefined &&
            typeof window.location !== 'undefined' &&
            window.location.href) ||
          '',
        page_path:
          (typeof window !== undefined &&
            typeof window.location !== 'undefined' &&
            window.location.pathname) ||
          '',
        page_title:
          page ||
          (typeof window !== undefined &&
            typeof window.document !== 'undefined' &&
            window.document.title) ||
          '',
        page_url:
          (typeof window !== undefined &&
            typeof window.location !== 'undefined' &&
            window.location.href.split('?')[0]) ||
          '',
      }
    : { page_title: page };

const DEFAULT_AMPLITUDE_OPTIONS: AmplitudeClientOptions = {
  includeBasePageViewData: true,
};

export class AmplitudeClient extends AnalyticsClient {
  readonly clientName = 'amplitude';

  private amplitudeClient: typeof client;
  private readonly options: AmplitudeClientOptions;

  constructor(
    amplitudeClient: typeof client,
    options: AmplitudeClientOptions = DEFAULT_AMPLITUDE_OPTIONS,
  ) {
    super();

    this.amplitudeClient = amplitudeClient;
    this.options = options;
  }

  identifyUser<
    U extends object | undefined = Record<string, ValidPropertyType>,
  >(id: string, otherInfo?: U): void {
    if (id) {
      this.amplitudeClient.setUserId(id);
    }

    if (otherInfo && typeof otherInfo === 'object') {
      const identifyObj = new client.Identify();

      for (const [key, value] of Object.entries(otherInfo)) {
        identifyObj.set(key, value);
      }

      this.amplitudeClient.identify(identifyObj);
    }
  }

  page<T extends object | undefined>(page: string, properties: T): void {
    // mimic the @amplitude/plugin-page-view-tracking-browser library
    // https://github.com/amplitude/Amplitude-TypeScript/blob/main/packages/plugin-page-view-tracking-browser/src/page-view-tracking.ts#L108
    this.amplitudeClient.track('Page View', {
      ...getBasePageData(page, this.options.includeBasePageViewData),
      ...properties,
    });
  }

  sendEvent<T extends object | undefined>(event: string, properties: T): void {
    this.amplitudeClient.track(event, properties);
  }
}
