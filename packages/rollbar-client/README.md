# `@reactalytics/rollbar-client`

This is the error client that can be used in conjunction with `@reactalytics/core` to send error events to [Rollbar](https://rollbar.com/).

For more general documentation on how to send events, subscribe/unsubscribe providers, and more, review the [root-level README](../../README.md).

Rollbar is configured as an error client, so the API for events that will be sent to Rollbar is limited to:

```ts
import { ErrorLogLevel } from '@reactalytics/core';
import { LogArgument, Payload } from 'rollbar';

// identifyUser is used to associate events, page views, and errors with an individual user
identifyUser(
    id: string,
    otherInfo?: Payload['person'],
    // If an explicit list of clients is not passed in, user identity will be sent to all registered clients
    clients?: Array<string>,
): void;

// trackError is used to send error events to error tracking clients
trackError(
    message: string,
    errorInfo?: LogArgument | Array<LogArgument>,
    level?: ErrorLogLevel,
    clients?: Array<string>,
): void;
```

> Note, `clients` is an optional parameter, if you'd like to limit the event to being sent to only specific providers.

## Usage

### Install
```bash
npm install --save @reactalytics/core @reactalytics/rollbar-client
```

or

```bash
yarn add @reactalytics/core @reactalytics/rollbar-client
```

`index.tsx`
```tsx
import React from 'react';
import Rollbar from 'rollbar';
import { ReactalyticsProvider } from '@reactalytics/core';
import { RollbarClient } from '@reactalytics/rollbar-client';
import HomePage from './home-page';

const rollbarClient = new RollbarClient(
    new Rollbar({ accessToken: process.env.ROLLBAR_ACCESS_TOKEN }),
);

const clients = [rollbarClient];

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
