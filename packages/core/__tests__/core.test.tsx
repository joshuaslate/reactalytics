import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AnalyticsClient } from '../src/analytics-client';
import { ReactalyticsProvider, useReactalytics } from '../src/context';
import { ErrorClient } from '../src/error-client';

const wrapper = ({ children }) => (
  <ReactalyticsProvider>
    <div>{children}</div>
  </ReactalyticsProvider>
);

class NoOpAnalyticsClient extends AnalyticsClient {
  readonly clientName = 'noop';

  mockedIdentify: jest.MockedFn<any>;
  mockedPage: jest.MockedFn<any>;
  mockedEvent: jest.MockedFn<any>;

  constructor(
    mockedIdentify: jest.MockedFn<any> = jest.fn(),
    mockedPage: jest.MockedFn<any> = jest.fn(),
    mockedEvent: jest.MockedFn<any> = jest.fn(),
  ) {
    super();
    this.mockedIdentify = mockedIdentify;
    this.mockedPage = mockedPage;
    this.mockedEvent = mockedEvent;
  }

  identifyUser<U = {}>(id: string, otherInfo?: U): void {
    this.mockedIdentify(id, otherInfo);
  }

  page<T = {}>(page: string, properties: T): void {
    this.mockedPage(page, properties);
  }

  sendEvent<T = {}>(event: string, properties: T): void {
    this.mockedEvent(event, properties);
  }
}

class NoOpErrorClient extends ErrorClient {
  readonly clientName = 'noop_error';

  mockedIdentify: jest.MockedFn<any>;
  mockedTrackError: jest.MockedFn<any>;

  constructor(
    mockedIdentify: jest.MockedFn<any> = jest.fn(),
    mockedTrackError: jest.MockedFn<any> = jest.fn(),
  ) {
    super();
    this.mockedIdentify = mockedIdentify;
    this.mockedTrackError = mockedTrackError;
  }

  identifyUser<U = {}>(id: string, otherInfo?: U): void {
    this.mockedIdentify(id, otherInfo);
  }

  trackError<T = []>(error: string, properties: T): void {
    this.mockedTrackError(error, properties);
  }
}

describe('@reactalytics/core', () => {
  it('should register and unregister a client', () => {
    const { result } = renderHook(() => useReactalytics(), { wrapper });
    const mockAnalyticsClient = new NoOpAnalyticsClient();

    act(() => {
      result.current.registerClients(mockAnalyticsClient);
    });

    expect(
      result.current.registeredAnalyticsClients.includes(
        mockAnalyticsClient.clientName,
      ),
    ).toBe(true);

    act(() => {
      result.current.unregisterClients(mockAnalyticsClient.clientName);
    });

    expect(
      result.current.registeredAnalyticsClients.includes(
        mockAnalyticsClient.clientName,
      ),
    ).toBe(false);
  });

  it('should identify a user on analytics & error clients', () => {
    const mockAnalyticsClient = new NoOpAnalyticsClient();
    const mockErrorClient = new NoOpErrorClient();

    const { result } = renderHook(() => useReactalytics(), { wrapper });

    const id = 'c5a23ea4-adaa-44b6-bea3-530c44107249';
    const meta = {
      username: 'TestUser',
      email: 'test@test.com',
    };

    act(() => {
      result.current.registerClients(mockAnalyticsClient, mockErrorClient);
    });

    act(() => {
      result.current.identifyUser(id, meta);
    });

    expect(mockAnalyticsClient.mockedIdentify).toHaveBeenCalledWith(id, meta);
    expect(mockErrorClient.mockedIdentify).toHaveBeenCalledWith(id, meta);
  });

  it('should fire a page event to analytics clients', () => {
    const mockAnalyticsClient = new NoOpAnalyticsClient();

    const { result } = renderHook(() => useReactalytics(), { wrapper });

    const page = 'Shop - Clothing';
    const meta = {
      filters: {
        productType: 'shirt',
        size: 'M',
      },
    };

    act(() => {
      result.current.registerClients(mockAnalyticsClient);
    });

    act(() => {
      result.current.page(page, meta);
    });

    expect(mockAnalyticsClient.mockedPage).toHaveBeenCalledWith(page, meta);
  });

  it('should fire an analytics event to analytics clients', () => {
    const mockAnalyticsClient = new NoOpAnalyticsClient();

    const { result } = renderHook(() => useReactalytics(), { wrapper });

    const event = 'add_to_cart_clicked';
    const meta = { product: 'Henley' };

    act(() => {
      result.current.registerClients(mockAnalyticsClient);
    });

    act(() => {
      result.current.sendEvent(event, meta);
    });

    expect(mockAnalyticsClient.mockedEvent).toHaveBeenCalledWith(event, meta);
  });

  it('should fire an error tracking event to error clients', () => {
    const mockErrorClient = new NoOpErrorClient();

    const { result } = renderHook(() => useReactalytics(), { wrapper });

    const errorMessage = 'Critical Error';
    const details = [
      new Error('Super detailed stacktrace in here'),
      new Date(0),
    ];

    act(() => {
      result.current.registerClients(mockErrorClient);
    });

    act(() => {
      result.current.trackError(errorMessage, details);
    });

    expect(mockErrorClient.mockedTrackError).toHaveBeenCalledWith(
      errorMessage,
      details,
    );
  });
});
