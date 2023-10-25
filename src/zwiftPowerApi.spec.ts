import { expect, test, beforeAll, describe } from 'vitest';
import ZwiftPowerAPI from './zwiftPowerApi';

describe('ZwiftPowerAPI', () => {
  let api: ZwiftPowerAPI;
  const athleteId = 2822923;
  const eventId = '3859519';

  beforeAll(() => {
    // authentication is time-intensive, so we do it once for all tests
    api = new ZwiftPowerAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
  });

  test('getCriticalPowerProfile for an athlete', async () => {
    const response = await api.getCriticalPowerProfile(athleteId);
    expect(response).toHaveProperty('efforts');
    expect(response).toHaveProperty('events');
    expect(response).toHaveProperty('info');
  });

  test('getCriticalPowerProfile for an athlete in a single event', async () => {
    const response = await api.getCriticalPowerProfile(athleteId, eventId);
    expect(response).toHaveProperty('efforts');
    expect(response).toHaveProperty('events');
    expect(response).toHaveProperty('info');
  });

  test('getEventResults', async () => {
    const response = await api.getEventResults(eventId);
    expect(response).toHaveProperty('data');
  });
});
