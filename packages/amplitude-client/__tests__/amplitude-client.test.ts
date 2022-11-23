import * as amplitude from '@amplitude/analytics-browser';
import { AmplitudeClient, getBasePageData } from '../src/amplitude-client';

jest.mock('@amplitude/analytics-browser', () => {
  const { Identify } = jest.requireActual('@amplitude/analytics-browser');

  return {
    init: jest.fn(),
    identify: jest.fn(),
    setUserId: jest.fn(),
    track: jest.fn(),
    Identify,
  };
});

describe('@reactalytics/amplitude-client', () => {
  it('should call setUserId and identify with person data when identifying a user', () => {
    amplitude.init('fake-api-key');
    const client = new AmplitudeClient(amplitude);

    const id = 'c5a23ea4-adaa-44b6-bea3-530c44107249';
    const meta = {
      username: 'TestUser',
      email: 'test@test.com',
    };

    client.identifyUser(id, meta);

    const expected = new amplitude.Identify();
    expected.set('username', meta.username);
    expected.set('email', meta.email);

    expect(amplitude.setUserId).toHaveBeenCalledWith(id);
    expect(amplitude.identify).toHaveBeenCalledWith(expected);
  });

  it('should call track with page data when tracking a page view when including base page view data', () => {
    amplitude.init('fake-api-key');
    const client = new AmplitudeClient(amplitude);
    const pageTitle = 'Shopping Cart';
    const parameters = { products_in_cart: 3 };

    client.page(pageTitle, parameters);

    expect(amplitude.track).toHaveBeenCalledWith('Page View', {
      ...getBasePageData(pageTitle, true),
      ...parameters,
    });
  });

  it('should call track without full page data when tracking a page view when not including base page view data', () => {
    amplitude.init('fake-api-key');
    const client = new AmplitudeClient(amplitude, {
      includeBasePageViewData: false,
    });
    const pageTitle = 'Shopping Cart';
    const parameters = { products_in_cart: 3 };

    client.page(pageTitle, parameters);

    expect(amplitude.track).toHaveBeenCalledWith('Page View', {
      ...getBasePageData(pageTitle, false),
      ...parameters,
    });
  });

  it('should call track with event data', () => {
    amplitude.init('fake-api-key');
    const client = new AmplitudeClient(amplitude);
    const event = 'Clicked Add to Cart CTA';
    const parameters = { product_name: 'Yonex VCore Pro 97H', quantity: 2 };

    client.sendEvent(event, parameters);

    expect(amplitude.track).toHaveBeenCalledWith(event, parameters);
  });
});
