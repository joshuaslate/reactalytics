import { AnalyticsBrowser } from '@segment/analytics-next';
import { SegmentClient } from '../src/segment-client';

describe('@reactalytics/segment-client', () => {
  it('should call identify with trait data when identifying a user', () => {
    const segmentAnalytics = new AnalyticsBrowser();
    segmentAnalytics.load = jest.fn();

    segmentAnalytics.load({
      writeKey: 'fake-write-key',
    });

    segmentAnalytics.identify = jest.fn();

    const client = new SegmentClient(segmentAnalytics);

    const id = 'c5a23ea4-adaa-44b6-bea3-530c44107249';
    const meta = {
      username: 'TestUser',
      email: 'test@test.com',
    };

    client.identifyUser(id, meta);

    expect(segmentAnalytics.identify).toHaveBeenCalledWith(id, meta, {});
  });

  it('should call track with page data when tracking a page view when including base page view data', () => {
    const segmentAnalytics = new AnalyticsBrowser();
    segmentAnalytics.load = jest.fn();

    segmentAnalytics.load({
      writeKey: 'fake-write-key',
    });

    segmentAnalytics.page = jest.fn();

    const client = new SegmentClient(segmentAnalytics);

    const pageTitle = 'Shopping Cart';
    const parameters = { products_in_cart: 3, category: 'e-commerce' };

    client.page(pageTitle, parameters);

    const { category, ...rest } = parameters;

    expect(segmentAnalytics.page).toHaveBeenCalledWith(
      category,
      pageTitle,
      rest,
      {},
    );
  });

  it('should call track with event data', () => {
    const segmentAnalytics = new AnalyticsBrowser();
    segmentAnalytics.load = jest.fn();

    segmentAnalytics.load({
      writeKey: 'fake-write-key',
    });

    segmentAnalytics.track = jest.fn();

    const client = new SegmentClient(segmentAnalytics);

    const event = 'Clicked Add to Cart CTA';
    const parameters = { product_name: 'Yonex VCore Pro 97H', quantity: 2 };

    client.sendEvent(event, parameters);

    expect(segmentAnalytics.track).toHaveBeenCalledWith(event, parameters, {});
  });
});
