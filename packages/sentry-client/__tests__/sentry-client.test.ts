import * as Sentry from '@sentry/react';
import { SentryClient } from '../src/sentry-client';

jest.mock('@sentry/react', () => {
  const setUserMock = jest.fn();
  const captureExceptionMock = jest.fn();

  return {
    init: jest.fn(),
    captureException: captureExceptionMock,
    setUser: setUserMock,
    getCurrentHub: jest.fn(() => ({
      setUser: setUserMock,
      captureException: captureExceptionMock,
    })),
  };
});

describe('@reactalytics/sentry-client', () => {
  let client: SentryClient;

  beforeEach(() => {
    // @ts-ignore
    Sentry.getCurrentHub.mockClear();
    // @ts-ignore
    Sentry.captureException.mockClear();
    Sentry.init({});
    client = new SentryClient();
  });

  it('should call setUser with id and other user data when identifying a user', () => {
    const id = 'c5a23ea4-adaa-44b6-bea3-530c44107249';
    const meta = {
      username: 'TestUser',
      email: 'test@test.com',
    };

    client.identifyUser(id, meta);

    expect(Sentry.setUser).toHaveBeenCalledWith({ id, ...meta });
  });

  it('should capture an exception with the message if no errors are passed', () => {
    const errString = 'test error';
    client.trackError(errString);
    expect(Sentry.captureException).toHaveBeenCalledWith(new Error(errString));
  });

  it('should capture an exception with the errors, not the message, if errors are passed', () => {
    const errString = 'general test error';
    const err1 = new Error('error #1');
    const err2 = new Error('error #2');
    client.trackError(errString, [err1, err2]);

    expect(Sentry.captureException).not.toHaveBeenCalledWith(
      new Error(errString),
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(err1);
    expect(Sentry.captureException).toHaveBeenCalledWith(err2);
  });
});
