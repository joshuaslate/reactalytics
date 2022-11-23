# `@reactalytics/sentry-client`

[![npm info](https://img.shields.io/npm/dm/@reactalytics/sentry-client)](https://www.npmjs.com/package/@reactalytics/sentry-client)

This is the error client that can be used in conjunction with `@reactalytics/core` to send error events to [Sentry](https://sentry.io/).

For more general documentation on how to send events, subscribe/unsubscribe providers, and more, review the [root-level README](../../README.md).

Sentry is configured as an error client, so the API for events that will be sent to Sentry is limited to:

```ts
import { ErrorLogLevel } from '@reactalytics/core';
import { User } from '@sentry/types';

// identifyUser is used to associate events, page views, and errors with an individual user
identifyUser(
    id: string,
    otherInfo?: User,
    // If an explicit list of clients is not passed in, user identity will be sent to all registered clients
    clients?: Array<string>,
): void;

// trackError is used to send error events to error tracking clients
trackError(
    message: string,
    errorInfo?: Error | Array<Error>,
    level?: ErrorLogLevel,
    clients?: Array<string>,
): void;
```

> Note, `clients` is an optional parameter, if you'd like to limit the event to being sent to only specific providers.

## Usage

### Install
```bash
npm install --save @reactalytics/core @reactalytics/sentry-client
```

or

```bash
yarn add @reactalytics/core @reactalytics/sentry-client
```

`index.tsx`
```tsx
import React from 'react';
import * as Sentry from '@sentry/browser';
import { ReactalyticsProvider } from '@reactalytics/core';
import { SentryClient } from '@reactalytics/sentry-client';
import HomePage from './home-page';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
});

// The `hub` argument passed to the SentryClient constructor is optional
const sentryClient = new SentryClient(Sentry.getCurrentHub());

const clients = [sentryClient];

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
    const { identifyUser, trackError } = useReactalytics();
    
    React.useEffect(() => {
        if (user?.id) {
            identifyUser(user.id, { name: user.name, email: user.email });
        }
    }, [user?.id, identifyUser]);
    
    return (
        <button
            onClick={() => {
                try {
                    throw new Error('user should not click this button');
                } catch (err) {
                    trackError('forbidden_click', err);
                }
            }}
        >
            Do not click here
        </button>
    )
}

export default HomePage;
```
