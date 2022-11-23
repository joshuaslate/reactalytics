import { useEffect } from 'react';
import { AnalyticsClient } from '@reactalytics/core';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any) => void;
  }
}

export interface GTMClientOptions {
  scriptId?: string;
  addScriptToDOM?: boolean;
}

const addAnalyticsScript = (
  propertyId: string,
  scriptId: string = `ga-${new Date().valueOf()}`,
): Node => {
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${propertyId}`;

  document.head.insertBefore(script, document.head.firstChild);

  window.dataLayer = window.dataLayer || [];

  return script;
};

export const useGTMAnalyticsScript = (
  propertyId: string,
  providedScriptId?: string,
) => {
  useEffect(() => {
    const scriptNode = addAnalyticsScript(propertyId, providedScriptId);

    return () => {
      window.document.removeChild(scriptNode);
    };
  }, [propertyId, providedScriptId]);
};

const DEFAULT_OPTIONS: GTMClientOptions = {
  scriptId: 'ga-gtag',
  addScriptToDOM: typeof window !== 'undefined',
};

export class GTMClient extends AnalyticsClient {
  readonly clientName = 'gtm';

  private readonly propertyId: string;

  gtag: Function = function gtag() {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(arguments);
    }
  };

  constructor(propertyId: string, options: GTMClientOptions = DEFAULT_OPTIONS) {
    super();

    if (options.addScriptToDOM && !document.getElementById(options.scriptId)) {
      addAnalyticsScript(propertyId, options.scriptId);
    }

    this.propertyId = propertyId;

    this.gtag('js', new Date());

    // Disable automatic page view tracking, it is handled with the `page` method manually
    this.gtag('config', propertyId, { send_page_view: false });
  }

  identifyUser<U extends Object = undefined>(id: string, otherInfo?: U): void {
    this.gtag('config', this.propertyId, { user_id: id, ...otherInfo });
  }

  page<T extends Object>(page: string, properties: T): void {
    this.gtag('config', this.propertyId, {
      page_title: page,
      send_page_view: true,
      ...properties,
    });
  }

  sendEvent<T extends Object | undefined>(event: string, properties: T): void {
    this.gtag('event', event, properties);
  }
}
