import { expect, test, beforeAll, describe } from 'vitest';
import ZwiftAPI from './zwiftApi';

describe('ZwiftPowerAPI', () => {
  let api: ZwiftAPI;
  const athleteId = 2822923;
  const eventId = '3859519';

  beforeAll(async () => {
    // authentication is time-intensive, so we do it once for all tests
    api = new ZwiftAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
    await api.authenticate();
  });

  test.only('getProfile', async () => {
    const response = await api.getProfile(athleteId);
    expect(response?.id).toEqual(athleteId);
  });
});
