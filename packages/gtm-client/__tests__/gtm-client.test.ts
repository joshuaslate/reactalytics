import { GTMClient } from '../src/gtm-client';

describe('@reactalytics/gtm-client', () => {
  const propertyId = 'UA-999999-1';
  const scriptId = 'ga-tag-test';

  it('should prepend the gtm script into the <head /> tag', () => {
    expect(window.document.getElementById(scriptId)).toBeFalsy();

    new GTMClient(propertyId, { scriptId, addScriptToDOM: true });

    expect(window.document.getElementById(scriptId)).toBeTruthy();
  });

  it('should call gtag `config` event with person data when identifying a user', () => {
    const id = 'c5a23ea4-adaa-44b6-bea3-530c44107249';
    const meta = {
      username: 'TestUser',
      email: 'test@test.com',
    };

    const client = new GTMClient(propertyId, {
      scriptId,
      addScriptToDOM: true,
    });

    client.gtag = jest.fn();

    client.identifyUser(id, meta);

    expect(client.gtag).toHaveBeenCalledWith('config', propertyId, {
      user_id: id,
      ...meta,
    });
  });

  it('should call gtag `config` event with page and parameter data when tracking a page view', () => {
    const page = 'Shopping Cart';
    const params = {
      items: 3,
      cartValue: '$42.50',
    };

    const client = new GTMClient(propertyId, {
      scriptId,
      addScriptToDOM: true,
    });

    client.gtag = jest.fn();

    client.page(page, params);

    expect(client.gtag).toHaveBeenCalledWith('config', propertyId, {
      page_title: page,
      send_page_view: true,
      ...params,
    });
  });

  it('should call gtag `event` with event name and parameter data when tracking an action', () => {
    const event = 'Clicked Add to Cart CTA';
    const params = {
      product_name: 'Yonex VCore Pro 97H',
      quantity: 2,
    };

    const client = new GTMClient(propertyId);

    client.gtag = jest.fn();

    client.sendEvent<typeof params>(event, params);

    expect(client.gtag).toHaveBeenCalledWith('event', event, params);
  });
});
