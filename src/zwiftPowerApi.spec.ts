import { expect, test, beforeAll, describe } from 'vitest';
import { ZwiftPowerAPI } from './zwiftPowerApi';

const athleteId = 2822923;
const eventId = '3859519';

describe('ZwiftPowerAPI', () => {
  let api: ZwiftPowerAPI;
  let authTokens: string | undefined;

  beforeAll(async () => {
    // authentication is time-intensive, so we do it once for all tests
    api = new ZwiftPowerAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
    authTokens = await api.authenticate();
  });

  test('getCriticalPowerProfile for an athlete', async () => {
    const response = await api.getCriticalPowerProfile(athleteId);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('efforts');
    expect(response.body).toHaveProperty('events');
    expect(response.body).toHaveProperty('info');
  });

  test('getCriticalPowerProfile for an athlete in a single event', async () => {
    const response = await api.getCriticalPowerProfile(athleteId, eventId);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('efforts');
    expect(response.body).toHaveProperty('events');
    expect(response.body).toHaveProperty('info');
  });

  test('getEventResults', async () => {
    const response = await api.getEventResults(eventId);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('data');
  });

  test('auth cookies returned from authenticate() can be used to re-authenticate', async () => {
    const api2 = new ZwiftPowerAPI();
    await api2.authenticate(authTokens);
    const response = await api2.getCriticalPowerProfile(athleteId);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('efforts');
  });
});
