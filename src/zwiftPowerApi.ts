import type {
  ZwiftAPIWrapperResponse,
  ZwiftPowerActivityAnalysis,
  ZwiftPowerActivityResults,
  ZwiftPowerCriticalPowerProfile,
  ZwiftPowerEventResults,
  ZwiftPowerEventViewResults,
} from './types';

import https from 'https';
import assert from 'assert';
import { IncomingMessage } from 'http';
import BaseApi from './baseApi';

function _toJSON<T>(response: ZwiftAPIWrapperResponse<string>): ZwiftAPIWrapperResponse<T> {
  try {
    if(!response.body) {
      return {
        ...response,
        body: undefined,
      };
    }
    return {
      ...response,
      body: JSON.parse(response.body) as T,
    };
  } catch (e) {
    console.error(`Error parsing JSON`);
    console.error(response.body);
    return {
      ...response,
      error: `Error parsing JSON: ${response.body}}`,
      body: undefined,
    };
  }
}

export class ZwiftPowerAPI extends BaseApi {
  private _username: string = '';
  private _password: string = '';

  constructor();
  constructor(username: string, password: string);
  constructor(username?: string, password?: string) {
    super();
    if (username && password) {
      this._username = username;
      this._password = password;
    }
  }

  async getAuthenticated(
    url: string,
    body: string | undefined = undefined,
    options = {},
  ): Promise<ZwiftAPIWrapperResponse<string>> {
    if (!await this._haveAuthCookie()) {
      await this.authenticate();
    }
    const response = await this.request(url, body, options);
    const statusCode = response.resp.statusCode || 0;
    return {
      statusCode,
      error: (statusCode === 0 || statusCode >= 400) ? response.data : undefined,
      body: response.data,
    };
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

  private _fixRedirect(location: string): string {
    return URL.canParse(location) ? location : `https://zwiftpower.com/${location}`;
  }

  async authenticate(cookies?: string): Promise<string> {
    if(cookies) {
      await this.setCookies(cookies);
      if (await this._haveAuthCookie()) {
        return cookies;
      }
    }

    const leg1response = await this.request('https://zwiftpower.com/ucp.php?mode=login&login=external&oauth_service=oauthzpsso');
    if (leg1response.resp.statusCode !== 302) {
      throw new Error(`Expected 302 got ${leg1response.resp.statusCode}`);
    }
    const leg1Location = leg1response.resp.headers['location'];
    assert(leg1Location, `Expected location header`);

    const leg2response = await this.request(this._fixRedirect(leg1Location));
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
    const leg3response = await this.request(this._fixRedirect(leg3Location));
    if (leg3response.resp.statusCode !== 302) {
      throw new Error(`Expected 302 got ${leg3response.resp.statusCode}`);
    }

    return JSON.stringify(await this._cookieJar.serialize());
  }

  private async _haveAuthCookie() {
    const cookies = await this._cookieJar.getCookies('https://zwiftpower.com/', {allPaths: true, expire: true});
    return !!cookies.find(c => c.key === 'phpbb3_lswlk_sid');
  }

  async getCriticalPowerProfile(
    athleteId: string | number,
    eventId: string | number = '',
    type: string = 'watts',
  ): Promise<ZwiftAPIWrapperResponse<ZwiftPowerCriticalPowerProfile>> {
    const url = `https://zwiftpower.com/api3.php?do=critical_power_profile&zwift_id=${encodeURIComponent(athleteId)}&zwift_event_id=${eventId}&type=${type}`;
    const result = await this.getAuthenticated(url);
    return _toJSON<ZwiftPowerCriticalPowerProfile>(result);
  }

  async getEventResults(eventId: string): Promise<ZwiftAPIWrapperResponse<ZwiftPowerEventResults>> {
    const url = `https://zwiftpower.com/cache3/results/${eventId}_zwift.json`;
    const result = await this.getAuthenticated(url);
    return _toJSON<ZwiftPowerEventResults>(result);
  }

  async getEventViewResults(eventId: string): Promise<ZwiftAPIWrapperResponse<ZwiftPowerEventViewResults>> {
    const url = `https://zwiftpower.com/cache3/results/${eventId}_view.json`;
    const result = await this.getAuthenticated(url);
    return _toJSON<ZwiftPowerEventViewResults>(result);
  }

  // Recent activities for this athlete.
  async getActivityResults(athleteId: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftPowerActivityResults>> {
    const url = `https://zwiftpower.com/cache3/profile/${athleteId}_all.json`;
    const result = await this.getAuthenticated(url);
    return _toJSON<ZwiftPowerActivityResults>(result);
  }

  async getActivityAnalysis(eventId: string | number, athleteId: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftPowerActivityAnalysis>> {
    const url = `https://zwiftpower.com/api3.php?do=analysis&zwift_id=${athleteId}&zwift_event_id=${eventId}`;
    const result = await this.getAuthenticated(url);
    return _toJSON<ZwiftPowerActivityAnalysis>(result);
  }
}
