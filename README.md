# Reactalytics

[![CI](https://github.com/joshuaslate/reactalytics/actions/workflows/main.yml/badge.svg)](https://github.com/joshuaslate/reactalytics/actions/workflows/main.yml) [![Node version](https://img.shields.io/npm/dm/@reactalytics/core.svg?maxAge=43200&label=v0.0.0%20downloads)](https://www.npmjs.com/package/@reactalytics/core) [![Code coverage](https://codecov.io/gh/joshuaslate/reactalytics/branch/main/graph/badge.svg)](https://codecov.io/gh/joshuaslate/reactalytics)

Abstraction for handling multiple analytics and error tracking clients in a React-based application. In larger apps, a codebase can end up having several analytics and error clients. For example, marketing may request Google Analytics, while a data science team would request Amplitude events. Even if your project is only using one analytics client and one error client, using an abstraction like Reactalytics allows you to switch providers on a dime if you decide. The goal of this library is to simplify tracking to a common interface, where events can be sent to as many providers as you want, in unison.

For example:

*Before*

```tsx
import * as amplitude from '@amplitude/analytics-browser';

export const CTA: React.FC = () => (
    <button
        onClick={()=> {
            window.gtag('event', 'cta_clicked', {color: 'red'});
            amplitude.track('cta_clicked', {color: 'red'});
            // So on, and so on, depending on how many analytics solutions your project uses
        }}
    >
        Click
    </button>
);
```

*After*

```tsx
import React from 'react';
import { useReactalytics } from '@reactalytics/core';

export const CTA: React.FC = () => {
    const { sendEvent } = useReactalytics();

    return (
        <button onClick={() => { sendEvent('cta_clicked', { color: 'red' }); }}>
            Click
        </button>
    );
};
```

## Usage

### Installation
```bash
npm install --save @reactalytics/core
```

or

```bash
yarn add @reactalytics/core
```

### Client Setup
You will need to set up the appropriate clients for your application. You can `npm install` or `yarn add` any of the following.

#### Analytics
- [`@reactalytics/gtm-client`](/packages/gtm-client) is the client for Google Tag Manager/Google Analytics
- [`@reactalytics/amplitude-client`](/packages/amplitude-client) is the client for Amplitude
- [`@reactalytics/segment-client`](/packages/segment-client) is the client for Segment (Analytics 2.0/Analytics Next version)

#### Error
- [`@reactalytics/rollbar-client`](/packages/rollbar-client) is the client for Rollbar
- [`@reactalytics/sentry-client`](/packages/sentry-client) is the client for Sentry

### Usage
`@reactalytics/core` comes with two debugging clients that simply `console.log|warn|error` the data that will be sent to your configured providers, one for analytics events and one for errors. The following example shows how to set them up. For more detail on setting up a specific analytics/error client, refer to the README for each individual client.

`app.tsx`
```tsx
import React from 'react';
import { ReactalyticsProvider, DebugAnalyticsClient, DebugErrorClient } from '@reactalytics/core';
import HomePage from './home-page';

const analyticsClient = new DebugAnalyticsClient();
const errorClient = new DebugErrorClient();
const clients = [analyticsClient, errorClient];

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
    const { getLinkClickEventHandler, identifyUser, page, sendEvent, trackError } = useReactalytics();
    const [clicks, setClicks] = React.useState(0);
    const handleShopLinkClick = getLinkClickEventHandler('Clicked Link: Cart', { from_page: 'home' }, 200);
    
    React.useEffect(() => {
        page('home_page', { additional_info: 'any meta info supported by your client(s) here' });
    }, []);
    
    React.useEffect(() => {
        if (user?.id) {
            identifyUser(user.id, { name: user.name, email: user.email });
        }
    }, [user?.id, identifyUser]);
    
    return (
        <div>
            <button
                onClick={() => {
                    try {
                        const newClicks = clicks + 1;
                        setClicks(newClicks);

                        sendEvent('cta_clicked', { location: 'home_page', clicks: newClicks });

                        if (newClicks % 2 === 0) {
                            throw new Error('experienced a terribly even number of clicks');
                        }
                    } catch (err) {
                        trackError('even_clicks_from_cta', err);
                    }
                }}
            >
                Clicks: {clicks}
            </button>
            <a onClick={handleShopLinkClick} href="/shop">To Shop</a>
        </div>
    )
}

export default HomePage;
```

## API

### Register/Unregister Clients
In order to start sending events, you must register them with the `ReactalyticsProvider`. There are two ways to do this.

#### Registration

##### Initialize the Provider with Desired Clients

Like in the example above, providing an array of `AnalyticsClient | ErrorClient` to the `ReactalyticsProvider` will register them from the start.

```tsx
import React from 'react';
import { ReactalyticsProvider, DebugAnalyticsClient, DebugErrorClient } from '@reactalytics/core';

const analyticsClient = new DebugAnalyticsClient();
const errorClient = new DebugErrorClient();
const clients = [analyticsClient, errorClient];

const App: React.FC = () => (
    <ReactalyticsProvider initialClients={clients}>
        {/* your app here */}
    </ReactalyticsProvider>
);

export default App;
```

##### Register Clients Asynchronously

In a child of `ReactalyticsProvider`, you may call `registerClients` from the `useReactalytics()` hook's return value.

```tsx
import React from 'react';
import { ReactalyticsProvider, DebugAnalyticsClient, DebugErrorClient, useReactalytics } from '@reactalytics/core';

/* registerClients(...clients: Array<AnalyticsClient | ErrorClient>): void; */

const TestComponent: React.FC = () => {
    const { registerClients } = useReactalytics();
    
    React.useEffect(() => {
        registerClients(new DebugErrorClient(), new DebugAnalyticsClient());
    }, []);
    
    return <div>Test</div>;
};

const App: React.FC = () => (
    <ReactalyticsProvider>
        <TestComponent />
    </ReactalyticsProvider>
);

export default App;
```

#### Unregister Clients

In a child of `ReactalyticsProvider`, you may call `unregisterClients` from the `useReactalytics()` hook's return value. This will cause the library to stop sending events to the unregistered clients.

> Note: `unregisterClients` currently accepts the clientName (`string` value), which is accessible at the `clientName` property of each instance of the `AnalyticsClient` and `ErrorClient` classes.

```tsx
import React from 'react';
import { ReactalyticsProvider, DebugAnalyticsClient, DebugErrorClient, useReactalytics } from '@reactalytics/core';

const analyticsClient = new DebugAnalyticsClient();
const errorClient = new DebugErrorClient();
const clients = [analyticsClient, errorClient];

/* unregisterClients(...clientNames: Array<string>): void; */

const TestComponent: React.FC = () => {
    const { unregisterClients } = useReactalytics();
    
    React.useEffect(() => {
        unregisterClients(analyticsClient.clientName, errorClient.clientName);
    }, []);
    
    return <div>Test</div>;
};

const App: React.FC = () => (
    <ReactalyticsProvider initialClients={clients}>
        <TestComponent />
    </ReactalyticsProvider>
);

export default App;
```

#### Verify Registration

In a child of `ReactalyticsProvider`, you may view the `registeredAnalyticsClients` and `registeredErrorClients` values from the `useReactalytics()` hook's return value. These will show you the clients that are registered to have events sent to them.

### API
`useReactalytics()` return value:

```ts
// identifyUser is used to associate events, page views, and errors with an individual user
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

  // sendEvent is used to track individual events ("Clicked CTA", "Submitted Form", etc.)
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
    redirectDelay?: number, // default: 200ms
    clients?: Array<string>,
  ): (event: React.MouseEvent<HTMLAnchorElement>) => void;

  // trackError is used to send error events to error tracking clients (Rollbar, Sentry, etc.)
  trackError<T extends Object | Error | undefined = undefined>(
    message: string,
    errorInfo?: T | Array<T>,
    level?: ErrorLogLevel,
    clients?: Array<string>,
  ): void;

  // registerClients adds reactalytics analytics and error tracking clients to the list of clients to send events to
  registerClients(...clients: Array<AnalyticsClient | ErrorClient>): void;

  // unregisterClients removes reactalytics analytics and error tracking clients from the list of clients to send events to
  unregisterClients(...clientNames: Array<string>): void;

  // registeredAnalyticsClients is the list of analytics clients that are registered/subscribed to events being fired
  // from identifyUser, page, and sendEvent
  readonly registeredAnalyticsClients: Array<string>;

  // registeredErrorClients is the list of error clients that are registered/subscribed to events being fired
  // from identifyUser and trackError
  readonly registeredErrorClients: Array<string>;
```

## Contribution
Feel free to contribute by forking this repository, making, testing, and building your changes, then opening a pull request. Please try to maintain a uniform code style.
