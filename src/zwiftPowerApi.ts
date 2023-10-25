import type {
  ZwiftPowerCriticalPowerProfile,
  ZwiftPowerEventResults,
} from '../types';

import https from 'https';
import assert from 'assert';
import { URL } from 'url';
import { IncomingMessage } from 'http';
import BaseApi from './baseApi';

function _toJSON<T>(data: string): T {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing JSON`);
    console.error(data);
    throw e;
  }
}

export default class ZwiftPowerAPI extends BaseApi {
  private _username: string;
  private _password: string;

  constructor(username: string, password: string) {
    super();
    this._username = username;
    this._password = password;
  }

  async getAuthenticated(url:string, body: string | undefined = undefined, options = {}) {
    if (!await this._haveAuthCookie()) {
      await this.authenticate();
    }
    return await this.request(url, body, options);
  }

  // Submit Zwift login form
  private async _doLoginSubmit(
    url: string,
    options: Partial<https.RequestOptions> = {},
    username: string,
    password: string
  ): Promise<{resp: IncomingMessage, data: string}> {
    const postData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    options.method = 'POST';
    options.headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Host': 'secure.zwift.com',
    };

    return this.request(url, postData, options);
  }

  async authenticate() {
    const leg1response = await this.request('https://zwiftpower.com/ucp.php?mode=login&login=external&oauth_service=oauthzpsso');
    if (leg1response.resp.statusCode !== 302) {
      throw new Error(`Expected 302 got ${leg1response.resp.statusCode}`);
    }
    const leg1Location = leg1response.resp.headers['location'];
    assert(leg1Location, `Expected location header`);

    const leg2response = await this.request(leg1Location);
    let leg3Location;
    if (leg2response.resp.statusCode === 200) {
      const loginSubmitUrl = leg2response.data.match(/<form .* action="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&')
      assert(loginSubmitUrl, `Expected login submit URL`);
      
      const loginSubmitResponse = await this._doLoginSubmit(loginSubmitUrl, {}, this._username, this._password);
      if (loginSubmitResponse.resp.statusCode !== 302) {
        throw new Error(`Expected 302 got ${loginSubmitResponse.resp.statusCode}`);
      }

      leg3Location = loginSubmitResponse.resp.headers['location'];
    } else if (leg2response.resp.statusCode === 302) {
      leg3Location = leg2response.resp.headers['location'];
    } else {
      throw new Error(`Expected 200 or 302 got ${leg2response.resp.statusCode}`);
    }

    assert(leg3Location, `Expected location header`);
    const leg3response = await this.request(leg3Location);
    if (leg3response.resp.statusCode !== 302) {
      throw new Error(`Expected 302 got ${leg3response.resp.statusCode}`);
    }
  }

  private async _haveAuthCookie() {
    const cookies = await this._cookieJar.getCookies('https://zwiftpower.com/', {allPaths: true, expire: true});
    return !!cookies.find(c => c.key === 'phpbb3_lswlk_sid');
  }

  async getCriticalPowerProfile(
    athleteId: string | number,
    eventId: string | number = '',
    type: string = 'watts',
  ): Promise<ZwiftPowerCriticalPowerProfile | undefined> {
    const url = `https://zwiftpower.com/api3.php?do=critical_power_profile&zwift_id=${encodeURIComponent(athleteId)}&zwift_event_id=${eventId}&type=${type}`;
    const result = await this.getAuthenticated(url);
    if(result.resp.statusCode !== 200) {
      console.error(`getCriticalPowerProfile(${athleteId}) expected 200 got ${result.resp.statusCode}`);
      return undefined;
    }
    return _toJSON<ZwiftPowerCriticalPowerProfile>(result.data);
  }

  async getEventResults(eventId: string) {
    const url = `https://zwiftpower.com/cache3/results/${eventId}_zwift.json`;
    const result = await this.getAuthenticated(url);
    if(result.resp.statusCode !== 200) {
      console.error(`getEventView(${eventId}) expected 200 got ${result.resp.statusCode}`);
      return undefined;
    }
    return _toJSON<ZwiftPowerEventResults>(result.data);
  }
}
