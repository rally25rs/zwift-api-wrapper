import { expect, test, beforeAll, describe } from 'vitest';
import { ZwiftAPI } from './zwiftApi';

const athleteId = 2822923;
const eventId = '3859519';

describe('ZwiftAPI', () => {
  let api: ZwiftAPI;

  beforeAll(async () => {
    // authentication is time-intensive, so we do it once for all tests
    api = new ZwiftAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
    await api.authenticate();
  });

  test('getProfile', async () => {
    const response = await api.getProfile(athleteId);
    expect(response?.id).toEqual(athleteId);
  });

  test('getActivityFeed', async () => {
    const response = await api.getActivityFeed();
    expect(response?.length).toBeGreaterThan(0);
  });
});

describe('ZwiftAPI auth token can be used between instances', () => {
  test('auth token is returned', async () => {
    const api = new ZwiftAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
    const tokens = await api.authenticate();

    const api2 = new ZwiftAPI();
    await api2.authenticate(tokens);
    const response = await api2.getProfile(athleteId);
    expect(response?.id).toEqual(athleteId);
  });
});
