# `@reactalytics/amplitude-client`

[![npm info](https://img.shields.io/npm/dm/@reactalytics/amplitude-client)](https://www.npmjs.com/package/@reactalytics/amplitude-client)

This is the analytics client that can be used in conjunction with `@reactalytics/core` to send tracking and page view events to [Amplitude](https://amplitude.com/).

For more general documentation on how to send events, subscribe/unsubscribe providers, and more, review the [root-level README](../../README.md).

Amplitude is configured as an analytics client, so the API for events that will be sent to Amplitude is limited to:

```ts
import React from 'react';
import type { ValidPropertyType } from '@amplitude/analytics-types';

identifyUser<U = Record<string, ValidPropertyType>>(
    id: string,
    otherInfo?: U,
    // If an explicit list of clients is not passed in, user identity will be sent to all registered clients
    clients?: Array<string>,
): void;

// page is used to track page views
// by default, information from window.location is sent with the event, but this can be toggled off in the options
// passed to the AmplitudeClient constructor
page<T extends Object | undefined>(
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
npm install --save @reactalytics/core @reactalytics/amplitude-client
```

or

```bash
yarn add @reactalytics/core @reactalytics/amplitude-client
```

`index.tsx`
```tsx
import React from 'react';
import { ReactalyticsProvider } from '@reactalytics/core';
import * as amplitude from '@amplitude/analytics-browser';
import { AmplitudeClient } from '@reactalytics/amplitude-client';
import HomePage from './home-page';

amplitude.init(process.env.AMPLITUDE_API_KEY);
const gtmClient = new AmplitudeClient(amplitude);

const clients = [gtmClient];

const App: React.FC = () => (
    <ReactalyticsProvider initialClients={clients}>
        {/* your app here */}
        <HomePage />
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
        page('Home Page', { locale: 'en-US' });
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

### Client Options

```ts
interface AmplitudeClientOptions {
    includeBasePageViewData?: boolean; // defaults to true
}
```
