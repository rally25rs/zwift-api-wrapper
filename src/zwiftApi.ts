import assert from 'assert';
import BaseApi from './baseApi';
import { RequestOptions } from 'https';
import { ZwiftActivities, ZwiftActivity, ZwiftActivityFitnessData, ZwiftAthleteFollow, ZwiftEvent, ZwiftGameInfo, ZwiftNotification, ZwiftPowerProfile, ZwiftProfile } from '../types';

const DEFAULT_REQUEST_TIMEOUT = 30000;

type ZwiftFetchOptions = RequestOptions & {
  host?: string;
  noAuth?: boolean;
  json?: unknown;
  apiVersion?: string;
  query?: URLSearchParams | Record<string, string | boolean | number | undefined>;
  timeout?: number;
  ok?: number[];
};

type ZwiftFetchPagedOptions = ZwiftFetchOptions & {
  start?: number;
  pageLimit?: number;
  limit?: number;
  onPage?: (page: unknown[]) => Promise<boolean | void>;
};

function toUrlSearchParams(query: ZwiftFetchOptions['query']): URLSearchParams {
  if (query && !(query instanceof URLSearchParams)) {
    const searchParams = Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
      acc[k] = v !== undefined && v !== null ? v.toString() : "";
      return acc;
    }, {});
    return new URLSearchParams(searchParams);
  }
  return query || new URLSearchParams();
}

export default class ZwiftAPI extends BaseApi {
  private _authHost: string = 'secure.zwift.com';
  private _apiHost: string = 'us-or-rly101.zwift.com';
  private _username: string;
  private _password: string;
  private _authToken: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  } | undefined = undefined;
  private _nextRefresh: NodeJS.Timeout | undefined = undefined;

  constructor(username: string, password: string) {
    super();
    this._username = username;
    this._password = password;
  }

  async authenticate(options: { host?: string } = {}) {
    if (options.host) {
      this._authHost = options.host;
    }
    const r = await this.fetch(
      "/auth/realms/zwift/protocol/openid-connect/token",
      {
        host: options.host || this._authHost,
        noAuth: true,
        method: "POST",
        ok: [200, 401],
      },
      {
        accept: "application/json",
      },
      new URLSearchParams({
        client_id: "Zwift Game Client",
        grant_type: "password",
        password: this._password,
        username: this._username,
      }).toString(),
    );
    const resp = r.data ? JSON.parse(r.data) : undefined;
    if (r.resp.statusCode === 401) {
      throw new Error(resp.error_description || "Login failed");
    }
    this._authToken = resp;
    assert(this._authToken, "Auth token not set");
    this._schedRefresh(this._authToken.expires_in * 1000 / 2);
  }

  private async _refreshToken() {
    if (!this._authToken) {
      console.warn("No auth token to refresh");
      return false;
    }
    const r = await this.fetch(
      "/auth/realms/zwift/protocol/openid-connect/token",
      {
        host: this._authHost,
        noAuth: true,
        method: "POST",
      },
      {
        accept: "application/json",
      },
      new URLSearchParams({
        client_id: "Zwift Game Client",
        grant_type: "refresh_token",
        refresh_token: this._authToken.refresh_token,
      }).toString(),
    );
    const resp = r.data ? JSON.parse(r.data) : undefined;
    this._authToken = resp;
    assert(this._authToken, "Auth token not set");
    this._schedRefresh(this._authToken.expires_in * 1000 / 2);
  }

  _schedRefresh(delay: number) {
    clearTimeout(this._nextRefresh);
    this._nextRefresh = setTimeout(
      this._refreshToken.bind(this),
      Math.min(0x7fffffff, delay),
    );
  }

  isAuthenticated() {
    return !!(this._authToken && this._authToken.access_token);
  }

  async fetch(
    urn: string,
    options: ZwiftFetchOptions = {},
    headers: RequestOptions['headers'] = {},
    body: string | undefined = undefined,
  ) {
    headers = headers || {};
    if (!options.noAuth) {
      if (!this.isAuthenticated()) {
        throw new TypeError("Auth token not set");
      }
      assert(this._authToken, "Auth token not set");
      headers["Authorization"] = `Bearer ${this._authToken.access_token}`;
    }
    if (options.json) {
      body = JSON.stringify(options.json);
      headers["Content-Type"] = "application/json";
    }
    if (body) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    if (options.apiVersion) {
      headers["Zwift-Api-Version"] = options.apiVersion;
    }
    const defHeaders = {
      "Platform": "OSX",
      "Source": "Game Client",
      "User-Agent":
        "CNL/3.30.8 (macOS 13 Ventura; Darwin Kernel 22.4.0) zwift/1.0.110983 curl/7.78.0",
    };
    const host = options.host || this._apiHost;
    let query = toUrlSearchParams(options.query);
    const q = query ? `?${query}` : "";
    const timeout = options.timeout !== undefined
      ? options.timeout
      : DEFAULT_REQUEST_TIMEOUT;
    const abort = new AbortController();
    const to = timeout && setTimeout(() => abort.abort(), timeout);
    let r;
    try {
      r = await this.request(`https://${host}/${urn.replace(/^\//, "")}${q}`, body, {
        signal: abort.signal,
        headers: { ...defHeaders, ...headers },
        ...options,
      });
    } finally {
      if (to) {
        clearTimeout(to);
      }
    }
    if (!r.resp.statusCode || (options.ok && !options.ok.includes(r.resp.statusCode)) || (!options.ok && r.resp.statusCode >= 400)) {
      const msg = r.data;
      const e = new Error(`Zwift HTTP Error: [${r.resp.statusCode}]: ${msg}`);
      throw e;
    }
    return r;
  }

  async fetchPaged(urn: string, options: ZwiftFetchPagedOptions = {}, headers?: RequestOptions['headers']) {
    const results: any[] = [];
    let start = options.start || 0;
    let pages = 0;
    const pageLimit = options.pageLimit == null ? 10 : options.pageLimit;
    const query = toUrlSearchParams(options.query);
    const limit = options.limit || 100;
    query.set("limit", limit.toString());
    while (true) {
      query.set("start", start.toString());
      const page = await this.fetchJSON(urn, { query, ...options }, headers);
      for (const x of page) {
        results.push(x);
      }
      if (options.onPage && page.length) {
        if (await options.onPage(page) === false) {
          break;
        }
      }
      if (page.length < limit || (pageLimit && ++pages >= pageLimit)) {
        break;
      }
      start = results.length;
    }
    return results;
  }

  async fetchJSON(urn: string, options: ZwiftFetchOptions = {}, headers: RequestOptions['headers'] = {}) {
    headers.accept = "application/json";
    const r = await this.fetch(urn, options, headers);
    if (r.resp.statusCode === 204) {
      return;
    }
    return JSON.parse(r.data);
  }

  async getProfile(athleteId: string | number, options: ZwiftFetchOptions = {}): Promise<ZwiftProfile | undefined> {
    try {
      return await this.fetchJSON(`/api/profiles/${athleteId}`, options);
    } catch (e: any) {
      if (e.status === 404) {
        return;
      }
      throw e;
    }
  }

  async getPowerProfile(): Promise<ZwiftPowerProfile> {
    return await this.fetchJSON(`/api/power-curve/power-profile`);
  }

  async getActivities(athleteId: string | number): Promise<ZwiftActivities | undefined> {
    try {
      return await this.fetchJSON(`/api/profiles/${athleteId}/activities`);
    } catch (e: any) {
      if (e.status === 404) {
        return;
      }
      throw e;
    }
  }

  async getActivity(id: string | number, fetchSnapshots = false, fetchEvent = false): Promise<ZwiftActivity | undefined> {
    try {
      return await this.fetchJSON(
        `/api/activities/${id}?fetchSnapshots=${fetchSnapshots ? 'true' : 'false'}&fetchEvent=${fetchEvent ? 'true' : 'false'}`,
      );
    } catch (e: any) {
      if (e.status === 404) {
        return;
      }
      throw e;
    }
  }

  async getGameInfo(): Promise<ZwiftGameInfo> {
    return await this.fetchJSON(`/api/game_info`, { apiVersion: "2.7" });
  }

  async searchProfiles(searchText: string, options = {}) {
    return await this.fetchPaged("/api/search/profiles", {
      method: "POST",
      json: { query: searchText },
      ...options,
    });
  }

  async getFollowing(athleteId: string | number, options = {}): Promise<ZwiftAthleteFollow[]> {
    return await this.fetchPaged(
      `/api/profiles/${athleteId}/followees`,
      options,
    );
  }

  async getFollowers(athleteId: string | number, options: ZwiftFetchPagedOptions = {}): Promise<ZwiftAthleteFollow[]> {
    return await this.fetchPaged(
      `/api/profiles/${athleteId}/followers`,
      options,
    );
  }

  async setFollowing(them: string | number, us: string | number) {
    return await this.fetchJSON(`/api/profiles/${us}/following/${them}`, {
      method: "POST",
      json: {
        followeeId: them,
        followerId: us,
      },
    });
  }

  async getNotifications(): Promise<ZwiftNotification[]> {
    return await this.fetchJSON(`/api/notifications`);
  }

  async getPrivateEventFeed(options: {from?: string, to?: string} = {}): Promise<unknown[]> {
    const start_date = options.from; // always see this used
    const end_date = options.to; // never see this used
    const query = { organizer_only_past_events: false, start_date, end_date };
    return await this.fetchJSON("/api/private_event/feed", { query });
  }

  async getPrivateEvent(id: string | number): Promise<unknown> {
    return await this.fetchJSON(`/api/private_event/${id}`);
  }

  async getEventSubgroupResults(eventSubgroupId: string | number) {
    let start = 0;
    const limit = 50; // 50 is max, but the endpoint is wicked fast
    const results = [];
    while (true) {
      const data = await this.fetchJSON(`/api/race-results/entries`, {
        query: {
          event_subgroup_id: eventSubgroupId,
          start,
          limit,
        },
      });
      for (const x of data.entries) {
        x.profileData.male = x.profileData.gender === "MALE";
        results.push(x);
      }
      if (data.entries.length < limit) {
        break;
      }
      start += data.entries.length;
    }
    return results;
  }

  async getEvent(id: string | number): Promise<ZwiftEvent> {
    return await this.fetchJSON(`/api/events/${id}`);
  }

  async getEventSubgroupEntrants(id: string | number): Promise<ZwiftProfile[]> {
    const entrants = [];
    const limit = 100;
    let start = 0;
    while (true) {
      const data = await this.fetchJSON(
        `/api/events/subgroups/entrants/${id}`,
        {
          query: {
            type: "all",
            participation: "signed_up",
            limit,
            start,
          },
        },
      );
      entrants.push(...data);
      if (data.length < limit) {
        break;
      }
      start += data.length;
    }
    return entrants;
  }

  async getActivityFitnessData(url: string): Promise<ZwiftActivityFitnessData> {
    return await this.fetchJSON(url);
  }

  async eventSubgroupSignup(id: string | number): Promise<unknown> {
    return await this.fetchJSON(`/api/events/subgroups/signup/${id}`, {
      method: "POST",
    });
  }
}
