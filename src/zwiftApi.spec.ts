import { expect, test, beforeAll, describe } from 'vitest';
import { ZwiftAPI } from './zwiftApi';
import { ZwiftAuthToken } from './types';

const athleteId = 2822923;
const eventId = '3859519';

describe('ZwiftAPI when authenticated', () => {
  let api: ZwiftAPI;
  let authTokens: ZwiftAuthToken | undefined;

  beforeAll(async () => {
    // authentication is time-intensive, so we do it once for all tests
    api = new ZwiftAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
    authTokens = await api.authenticate();
  });

  test('getProfile', async () => {
    const response = await api.getProfile(athleteId);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body?.id).toEqual(athleteId);
  });

  test('getActivityFeed', async () => {
    const response = await api.getActivityFeed();
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('auth token can be used between instances', async () => {
    const api2 = new ZwiftAPI();
    await api2.authenticate(authTokens);
    const response = await api2.getProfile(athleteId);
    expect(response.statusCode).toEqual(200);
    expect(response.body?.id).toEqual(athleteId);
  });

  test('isAuthenticated returns true', async () => {
    expect(await api.isAuthenticated()).toEqual(true);
  });
});

describe('ZwiftAPI when not authenticated', () => {
  test('isAuthenticated returns false', async () => {
    const api = new ZwiftAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
    expect(api.isAuthenticated()).toEqual(false);
  });
});
