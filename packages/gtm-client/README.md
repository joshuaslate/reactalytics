# `@reactalytics/gtm-client`

This is the analytics client that can be used in conjunction with `@reactalytics/core` to send tracking and page view events to [Google Tag Manager/Google Analytics](https://tagmanager.google.com/).

For more general documentation on how to send events, subscribe/unsubscribe providers, and more, review the [root-level README](../../README.md).

GTMClient is configured as an analytics client, so the API for events that will be sent to Google Tag Manager/Google Analytics is limited to:

```ts
import React from 'react';

identifyUser<U extends Object = undefined>(
    id: string,
    otherInfo?: U,
    // If an explicit list of clients is not passed in, user identity will be sent to all registered clients
    clients?: Array<string>,
): void;

// page is used to track page views
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
npm install --save @reactalytics/core @reactalytics/gtm-client
```

or

```bash
yarn add @reactalytics/core @reactalytics/gtm-client
```

`index.tsx`

```tsx
import React from 'react';
import { ReactalyticsProvider } from '@reactalytics/core';
import { GTMClient } from '@reactalytics/gtm-client';
import HomePage from './home-page';

const gtmClient = new GTMClient(process.env.GTM_PROPERTY_ID);

const clients = [gtmClient];

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

### Injecting GTM Script
The Google Tag Manager Script needs to be present on the page in order for `@reactalytics/gtm-client` to function.

There are three methods for accomplishing that:

1. You can manually add the script include in the `<head />` tag, as in the [official docs from Google](https://developers.google.com/tag-platform/tag-manager/web).
2. You can create the `GTMClient` with the default parameters and the script will be prepended to the `<head />` tag for you, i.e., `new GTMClient(propertyId)`.
3. You can use the `useGTMAnalyticsScript(propertyId)` hook provided by this library.

> Note: if using Next.js or another SSR solution, you will need to use option #1 or #3.

For either option 1. or 2., you will want to instantiate your `GTMClient` with custom options to disable prepending the script:

```tsx
import { GTMClient } from '@reactalytics/gtm-client';

const gtmClient = new GTMClient(process.env.GTM_PROPERTY_ID, {addScriptToDOM: false});
```

### Client Options

```ts
interface GTMClientOptions {
    scriptId?: string; // default: "ga-gtag"
    addScriptToDOM?: boolean; // default: true (if window is defined)
}
```
