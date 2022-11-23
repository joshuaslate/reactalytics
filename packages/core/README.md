# `@reactalytics/core`

Abstraction for handling multiple analytics and error tracking clients in a React-based application. In larger apps, a codebase can end up having several analytics and error clients. For example, marketing may request Google Analytics, while a data science team would request Amplitude events. Even if your project is only using one analytics client and one error client, using an abstraction like Reactalytics allows you to switch providers on a dime if you decide. The goal of this library is to simplify tracking to a common interface, where events can be sent to as many providers as you want, in unison.

This is the core library, which all client libraries depend on to fire off events.

View documentation at the root of the [repository](https://github.com/joshuaslate/reactalytics);

## Quick Usage Example

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
    const { identifyUser, page, sendEvent, trackError } = useReactalytics();
    const [clicks, setClicks] = React.useState(0);
    
    React.useEffect(() => {
        page('home_page', { additional_info: 'any meta info supported by your client(s) here' });
    }, []);
    
    React.useEffect(() => {
        if (user?.id) {
            identifyUser(user.id, { name: user.name, email: user.email });
        }
    }, [user?.id, identifyUser]);
    
    return (
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
    )
}

export default HomePage;
```
