import Rollbar from 'rollbar';
import { RollbarClient } from '../src/rollbar-client';
import { ErrorLogLevel } from '@reactalytics/core';

describe('@reactalytics/rollbar-client', () => {
  it('should call configure with person data when identifying a user', () => {
    const rb = new Rollbar();
    const client = new RollbarClient(rb);

    const id = 'c5a23ea4-adaa-44b6-bea3-530c44107249';
    const meta = {
      username: 'TestUser',
      email: 'test@test.com',
    };

    client.identifyUser(id, meta);

    expect(rb.configure).toHaveBeenCalledWith({
      payload: { person: { id, ...meta } },
    });
  });

  it.each([['log'], ['debug'], ['info'], ['warn'], ['error'], ['critical']])(
    'error logged with level %s should call corresponding method on rollbar client',
    (level: ErrorLogLevel) => {
      const rb = new Rollbar();
      const client = new RollbarClient(rb);
      const error = new Error('failed to handle something');
      const timestamp = new Date(0);
      const params = [error, timestamp];

      client.trackError(error.message, params, level);

      expect(rb[level]).toHaveBeenCalledWith(error.message, ...params);
    },
  );
});
