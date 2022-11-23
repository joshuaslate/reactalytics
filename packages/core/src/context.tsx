import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { AnalyticsClient } from './analytics-client';
import { ErrorClient, ErrorLogLevel } from './error-client';

interface ReactalyticsContextShape {
  // identifyUser is used to associate events, page views, and errors with an individual user
  identifyUser<U extends object | undefined>(
    id: string,
    otherInfo?: U,
    // If an explicit list of clients is not passed in, user identity will be sent to all registered clients
    clients?: Array<string>,
  ): void;

  // page is used to track page views
  page<T extends object | undefined>(
    page: string,
    properties?: T,
    // If an explicit list of clients is not passed in, page view event will be sent to all registered clients
    clients?: Array<string>,
  ): void;

  // sendEvent is used to track individual events ("Clicked CTA", "Submitted Form", etc.)
  sendEvent<T extends object | undefined>(
    event: string,
    properties?: T,
    // If an explicit list of clients is not passed in, event will be sent to all registered clients
    clients?: Array<string>,
  ): void;

  // getLinkClickEventHandler is a wrapper for "sendEvent" that is helpful for tracking link clicks that redirect the user
  // to another page. The redirection can cause the events not to be sent, so we artificially add a little delay to the redirection
  // in order to give time for the event to be sent
  getLinkClickEventHandler<T extends object | undefined>(
    event: string,
    properties?: T,
    redirectDelay?: number,
    clients?: Array<string>,
  ): (event: React.MouseEvent<HTMLAnchorElement>) => void;

  // trackError is used to send error events to error tracking clients
  trackError<T extends object | Error | string | undefined = undefined>(
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
}

const noop = () => {};

const ReactalyticsContext = createContext<ReactalyticsContextShape>({
  registeredAnalyticsClients: [],
  registeredErrorClients: [],
  getLinkClickEventHandler: () => noop,
  identifyUser: noop,
  page: noop,
  registerClients: noop,
  unregisterClients: noop,
  sendEvent: noop,
  trackError: noop,
});

interface Props {
  initialClients?: Array<AnalyticsClient | ErrorClient>;
}

export const ReactalyticsProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  initialClients,
}) => {
  const [clients, setClients] = useState(initialClients || []);
  const { registeredAnalyticsClients, registeredErrorClients } = useMemo(
    () =>
      clients.reduce(
        (registered, client) => {
          switch (client.clientType) {
            case 'analytics':
              registered.registeredAnalyticsClients.push(client);
              break;
            case 'error':
              registered.registeredErrorClients.push(client);
              break;
          }

          return registered;
        },
        { registeredAnalyticsClients: [], registeredErrorClients: [] },
      ),
    [clients],
  );

  const identifyUser = useCallback(
    <U extends object | undefined = undefined>(
      id: string,
      otherInfo?: U,
      // If an explicit list of clients is not passed in, user identity will be sent to all registered clients
      explicitClients?: Array<string>,
    ) => {
      const clientsToIdentifyUserWith = explicitClients
        ? clients.filter((client) =>
            explicitClients.includes(client.clientName),
          )
        : clients;

      clientsToIdentifyUserWith.forEach((client) => {
        client.identifyUser<U>(id, otherInfo);
      });
    },
    [clients],
  );

  const sendEvent = useCallback(
    <T extends object | undefined>(
      event: string,
      properties?: T,
      // If an explicit list of clients is not passed in, event will be sent to all registered clients
      explicitClients?: Array<string>,
    ) => {
      const clientsToFireEventWith = explicitClients
        ? registeredAnalyticsClients.filter((client) =>
            explicitClients.includes(client.clientName),
          )
        : registeredAnalyticsClients;

      clientsToFireEventWith.forEach((client) => {
        (client as AnalyticsClient).sendEvent<T>(event, properties);
      });
    },
    [registeredAnalyticsClients],
  );

  const page = useCallback(
    <T extends object | undefined>(
      page: string,
      properties?: T,
      // If an explicit list of clients is not passed in, page view event will be sent to all registered clients
      explicitClients?: Array<string>,
    ) => {
      const clientsToFireEventWith = explicitClients
        ? registeredAnalyticsClients.filter((client) =>
            explicitClients.includes(client.clientName),
          )
        : registeredAnalyticsClients;

      clientsToFireEventWith.forEach((client) => {
        (client as AnalyticsClient).page<T>(page, properties);
      });
    },
    [registeredAnalyticsClients],
  );

  const trackError = useCallback(
    <T extends object | Error | string | undefined = undefined>(
      message: string,
      errorInfo?: T | Array<T>,
      level?: ErrorLogLevel,
      explicitClients?: Array<string>,
    ) => {
      const clientsToFireEventWith = explicitClients
        ? registeredErrorClients.filter((client) =>
            explicitClients.includes(client.clientName),
          )
        : registeredErrorClients;

      clientsToFireEventWith.forEach((client) => {
        (client as ErrorClient).trackError<T>(
          message,
          Array.isArray(errorInfo) ? errorInfo : [errorInfo],
          level,
        );
      });
    },
    [registeredAnalyticsClients],
  );

  // Link clicks require a bit of time to ensure the analytics events are sent
  // before navigation changes
  const getLinkClickEventHandler = useCallback(
    <T extends object | undefined>(
        event: string,
        properties?: T,
        redirectDelay = 200,
        // If an explicit list of clients is not passed in, event will be sent to all registered clients
        explicitClients?: Array<string>,
      ) =>
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        const directTo = (e.currentTarget as HTMLAnchorElement).href;
        sendEvent<T>(event, properties, explicitClients);

        window.setTimeout(() => {
          window.location.href = directTo;
        }, redirectDelay);
      },
    [sendEvent],
  );

  const registerClients = useCallback(
    (...clientsToAdd: Array<AnalyticsClient | ErrorClient>) => {
      setClients((prevClients) => [
        ...prevClients.filter(
          (client) =>
            !clientsToAdd.find(
              (clientToAdd) => client.clientName === clientToAdd.clientName,
            ),
        ),
        ...clientsToAdd,
      ]);
    },
    [],
  );

  const unregisterClients = useCallback((...clientsToRemove: Array<string>) => {
    setClients((prevClients) =>
      prevClients.filter(
        (client) => !clientsToRemove.includes(client.clientName),
      ),
    );
  }, []);

  const value: ReactalyticsContextShape = useMemo(
    () => ({
      identifyUser,
      sendEvent,
      page,
      trackError,
      getLinkClickEventHandler,
      registerClients,
      unregisterClients,
      registeredAnalyticsClients: registeredAnalyticsClients.map(
        (client) => client.clientName,
      ),
      registeredErrorClients: registeredErrorClients.map(
        (client) => client.clientName,
      ),
    }),
    [
      registeredAnalyticsClients,
      registeredErrorClients,
      identifyUser,
      sendEvent,
      page,
      trackError,
    ],
  );

  return (
    <ReactalyticsContext.Provider value={value}>
      {children}
    </ReactalyticsContext.Provider>
  );
};

export const useReactalytics = () => useContext(ReactalyticsContext);
