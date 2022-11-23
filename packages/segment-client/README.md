# `@reactalytics/segment-client`

This is the analytics client that can be used in conjunction with `@reactalytics/core` to send tracking and page view events to [Segment](https://segment.com/).

For more general documentation on how to send events, subscribe/unsubscribe providers, and more, review the [root-level README](../../README.md).

> `@reactalytics/segment-client` works with `@segment/analytics-next`, which is part of Segment's Analytics 2.0 initiative. This will not work with analytics.js v1 implementations.

Segment is configured as an analytics client, so the API for events that will be sent to Segment is limited to:

```ts
import { SegmentClientPageParams } from '@reactalytics/segment-client';
import { Traits } from '@segment/analytics-next';

identifyUser<U = Traits>(
    id: string,
    otherInfo?: U,
    // If an explicit list of clients is not passed in, user identity will be sent to all registered clients
    clients?: Array<string>,
): void;

// page is used to track page views
// Segment recommends including an object with the key `category` in the `properties` object.
page<T = SegmentClientPageParams>(
    page: string,
    properties?: T,
    // If an explicit list of clients is not passed in, page view event will be sent to all registered clients
    clients?: Array<string>,
): void;

sendEvent<T extends Object | undefined>(
    event: string,
    properties?: T,
    // If an explicit list of clients is not passed in, event will be sent to all registered clients
    clients?: Array<string>,
): void;

// getLinkClickEventHandler is a wrapper for "sendEvent" that is helpful for tracking link clicks that redirect the user
// to another page. The redirection can cause the events not to be sent, so we artificially add a little delay to the redirection
// in order to give time for the event to be sent
getLinkClickEventHandler<T extends Object | undefined>(
    event: string,
    properties?: T,
    redirectDelay?: number,
    clients?: Array<string>,
): (event: React.MouseEvent<HTMLAnchorElement>) => void;
```
> Note, `clients` is an optional parameter, if you'd like to limit the event to being sent to only specific providers.

## Usage

### Install
```bash
npm install --save @reactalytics/core @reactalytics/segment-client
```

or

```bash
yarn add @reactalytics/core @reactalytics/segment-client
```

`index.tsx`

```tsx
import React from 'react';
import { ReactalyticsProvider } from '@reactalytics/core';
import { SegmentClient, Options } from '@reactalytics/segment-client';
import { AnalyticsBrowser } from '@segment/analytics-next';
import HomePage from './home-page';
import { uuid4 } from '@sentry/utils';

const segment = new AnalyticsBrowser();

// load can only be called once, and it can happen after user data has loaded and identifyUser() has been called
// if you don't want to log anonymous user data
segment.load({ writeKey: process.env.SEGMENT_WRITE_KEY });

// options is an optional parameter that will be passed to segment client commands (track, page, identify)
const options: Options = {
    integrations: [],
    anonymousId: uuid4(),
    timestamp: new Date()
    // ...
};

const segmentClient = new SegmentClient(segment, options);

const clients = [segmentClient];

const App: React.FC = () => (
    <ReactalyticsProvider initialClients={clients}>
        {/* your app here */}
        <HomePage/>
    </ReactalyticsProvider>
);

export default App;
```

`home-page.tsx`
```tsx
import React from 'react';
import { useReactalytics } from '@reactalytics/core';

const HomePage: React.FC = () => {
    const { user } = useAuthState();
    const { identifyUser, page, sendEvent } = useReactalytics();
    
    React.useEffect(() => {
        if (user?.id) {
            identifyUser(user.id, { name: user.name, email: user.email });
        }
    }, [user?.id, identifyUser]);
    
    React.useEffect(() => {
        page('Home Page', { category: 'public_site', locale: 'en-US' });
    }, [page]);
    
    return (
        <button
            onClick={() => {
                sendEvent('CTA Clicked', { cta_type: 'button' });
            }}
        >
            Click here
        </button>
    )
}

export default HomePage;
```
