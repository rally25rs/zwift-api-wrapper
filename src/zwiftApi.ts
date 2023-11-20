import assert from 'assert';
import BaseApi from './baseApi';
import { RequestOptions } from 'https';
import {
  ZwiftAPIOptions,
  ZwiftAPIWrapperResponse,
  ZwiftActivities,
  ZwiftActivity,
  ZwiftActivityFeed,
  ZwiftActivityFitnessData,
  ZwiftAthleteFollow,
  ZwiftAuthToken,
  ZwiftEvent,
  ZwiftGameInfo,
  ZwiftNotification,
  ZwiftProfilePowerCurve,
  ZwiftProfile,
} from './types';

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

export class ZwiftAPI extends BaseApi {
  private _authHost: string = 'secure.zwift.com';
  private _apiHost: string = 'us-or-rly101.zwift.com';
  private _username: string = '';
  private _password: string = '';
  private _authToken: ZwiftAuthToken | undefined = undefined;
  private _nextRefresh: NodeJS.Timeout | undefined = undefined;
  private _options: ZwiftAPIOptions = {};

  constructor(options?: ZwiftAPIOptions);
  constructor(username: string, password: string, options?: ZwiftAPIOptions);
  constructor(usernameOrOptions: string | ZwiftAPIOptions | undefined, password?: string, options?: ZwiftAPIOptions) {
    super();

    if (!usernameOrOptions) {
      this._options = {};
    } else if (typeof usernameOrOptions === 'object') {
      this._options = usernameOrOptions;
    } else {
      this._username = usernameOrOptions;
      this._password = password || '';
      this._options = options || {};
    }
  }

  async authenticate(authToken?: ZwiftAuthToken) {
    if (authToken) {
      this._authToken = authToken;
      if (this._authToken?.access_token && (this._authToken?.expires_at || 0) > new Date().getTime()) {
        return;
      }
    }
    if ((this._authToken?.expires_at || 0) <= new Date().getTime() && this._authToken?.refresh_token) {
      this._refreshToken();
    } else if (this._username && this._password) {
      const r = await this.fetch(
        "/auth/realms/zwift/protocol/openid-connect/token",
        {
          host: this._authHost,
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
      const resp = r.body ? JSON.parse(r.body) : undefined;
      if (r.statusCode === 401) {
        throw new Error(resp.error_description || "Login failed");
      }
      this._authToken = {
        access_token: resp.access_token,
        refresh_token: resp.refresh_token,
        expires_at: resp.expires_in * 1000 + Date.now(),
      };
      assert(this._authToken, "Auth token not set");
      this._schedRefresh(this._authToken.expires_at - 10000);
    } else {
      throw new Error('Login credentials not set');
    }
    return this._authToken;
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
    const resp = r.body ? JSON.parse(r.body) : undefined;
    this._authToken = {
      access_token: resp.access_token,
      refresh_token: resp.refresh_token,
      expires_at: resp.expires_in * 1000 + Date.now(),
    };
    assert(this._authToken, "Auth token not set");
    this._schedRefresh(this._authToken.expires_at - 10000);
  }

  _schedRefresh(refreshAt: number) {
    if(this._options?.autoRefreshAuth) {
      const delay = refreshAt - Date.now();
      clearTimeout(this._nextRefresh);
      this._nextRefresh = setTimeout(
        this._refreshToken.bind(this),
        Math.min(0x7fffffff, delay),
      );
    }
  }

  isAuthenticated(): boolean {
    return this._authToken?.access_token !== undefined
      && this._authToken?.expires_at !== undefined
      && this._authToken?.expires_at > new Date().getTime();
  }

  async fetch<T = unknown>(
    urn: string,
    options: ZwiftFetchOptions = {},
    headers: RequestOptions['headers'] = {},
    body: string | undefined = undefined,
  ): Promise<ZwiftAPIWrapperResponse<string>> {
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
      return {
        statusCode: r.resp.statusCode || 0,
        error: r.data,
        body: r.data,
      };
    }
    return {
      statusCode: r.resp.statusCode || 0,
      body: r.data,
    };
  }

  async fetchPaged<T extends Array<any>>(
    urn: string,
    options: ZwiftFetchPagedOptions = {},
    headers?: RequestOptions['headers'],
  ): Promise<ZwiftAPIWrapperResponse<T>> {
    const results: any[] = [];
    let start = options.start || 0;
    let pages = 0;
    const pageLimit = options.pageLimit == null ? 10 : options.pageLimit;
    const query = toUrlSearchParams(options.query);
    const limit = options.limit || 100;
    query.set("limit", limit.toString());
    while (true) {
      query.set("start", start.toString());
      const resp = await this.fetchJSON<T>(urn, { query, ...options }, headers);
      if(resp.statusCode >= 400) {
        return resp;
      }
      if(!resp.body) {
        return resp;
      }

      const page = resp.body;
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
    return {
      statusCode: 200,
      body: results as T,
    };
  }

  async fetchJSON<T = unknown>(
    urn: string,
    options: ZwiftFetchOptions = {},
    headers: RequestOptions['headers'] = {}
  ): Promise<ZwiftAPIWrapperResponse<T>> {
    headers.accept = "application/json";
    try {
      const r = await this.fetch(urn, options, headers);
      return {
        statusCode: r.statusCode || 0,
        error: r.error,
        body: (r.statusCode === 204 || r.statusCode === 404) ? undefined : JSON.parse(r.body || '') as T,
      };
    } catch (e: any) {
      return {
        statusCode: e.status || 0,
        error: e.message,
        body: e.data
      };
    }
  }

  async getProfile(
    athleteId: string | number,
    options: ZwiftFetchOptions = {},
  ): Promise<ZwiftAPIWrapperResponse<ZwiftProfile>> {
    return await this.fetchJSON<ZwiftProfile>(`/api/profiles/${athleteId}`, options);
  }

  async getPowerProfile(): Promise<ZwiftAPIWrapperResponse<ZwiftProfilePowerCurve>> {
    return await this.fetchJSON<ZwiftProfilePowerCurve>(`/api/power-curve/power-profile`);
  }

  async getActivities(athleteId: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftActivities>> {
    return await this.fetchJSON<ZwiftActivities>(`/api/profiles/${athleteId}/activities`);
  }

  async getActivity(id: string | number, fetchSnapshots = false, fetchEvent = false): Promise<ZwiftAPIWrapperResponse<ZwiftActivity>> {
    return await this.fetchJSON<ZwiftActivity>(
      `/api/activities/${id}?fetchSnapshots=${fetchSnapshots ? 'true' : 'false'}&fetchEvent=${fetchEvent ? 'true' : 'false'}`,
    );
  }

  async getGameInfo(): Promise<ZwiftAPIWrapperResponse<ZwiftGameInfo>> {
    return await this.fetchJSON<ZwiftGameInfo>(`/api/game_info`, { apiVersion: "2.7" });
  }

  async searchProfiles(searchText: string, options = {}) {
    return await this.fetchPaged("/api/search/profiles", {
      method: "POST",
      json: { query: searchText },
      ...options,
    });
  }

  async getFollowing(athleteId: string | number, options = {}): Promise<ZwiftAPIWrapperResponse<ZwiftAthleteFollow[]>> {
    return await this.fetchPaged<ZwiftAthleteFollow[]>(
      `/api/profiles/${athleteId}/followees`,
      options,
    );
  }

  async getFollowers(athleteId: string | number, options: ZwiftFetchPagedOptions = {}): Promise<ZwiftAPIWrapperResponse<ZwiftAthleteFollow[]>> {
    return await this.fetchPaged<ZwiftAthleteFollow[]>(
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

  async getNotifications(): Promise<ZwiftAPIWrapperResponse<ZwiftNotification[]>> {
    return await this.fetchJSON<ZwiftNotification[]>(`/api/notifications`);
  }

  async getPrivateEventFeed(options: {from?: string, to?: string} = {}): Promise<ZwiftAPIWrapperResponse<unknown[]>> {
    const start_date = options.from; // always see this used
    const end_date = options.to; // never see this used
    const query = { organizer_only_past_events: false, start_date, end_date };
    return await this.fetchJSON<unknown[]>("/api/private_event/feed", { query });
  }

  async getPrivateEvent(id: string | number): Promise<ZwiftAPIWrapperResponse<unknown>> {
    return await this.fetchJSON<unknown>(`/api/private_event/${id}`);
  }

  async getEventSubgroupResults(eventSubgroupId: string | number): Promise<ZwiftAPIWrapperResponse<unknown[]>> {
    return await this.fetchPaged<unknown[]>(`/api/race-results/entries`, {
      query: {
        event_subgroup_id: eventSubgroupId,
      },
    });
  }

  async getEvent(id: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftEvent>> {
    return await this.fetchJSON<ZwiftEvent>(`/api/events/${id}`);
  }

  async getEventSubgroupEntrants(id: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftProfile[]>> {
    return this.fetchPaged<ZwiftProfile[]>(`/api/events/subgroups/entrants/${id}`, {
      query: {
        type: "all",
        participation: "signed_up",
      },
    });
  }

  async getActivityFitnessData(url: string): Promise<ZwiftAPIWrapperResponse<ZwiftActivityFitnessData>> {
    return await this.fetchJSON<ZwiftActivityFitnessData>(url);
  }

  async eventSubgroupSignup(id: string | number): Promise<ZwiftAPIWrapperResponse<unknown>> {
    return await this.fetchJSON(`/api/events/subgroups/signup/${id}`, {
      method: "POST",
    });
  }

  async getActivityFeed(): Promise<ZwiftAPIWrapperResponse<ZwiftActivityFeed[]>> {
    return await this.fetchJSON<ZwiftActivityFeed[]>("/api/activity-feed/feed/", {
      query: {
        limit: 30,
        includeInProgress: false,
        feedType: "JUST_ME",
      },
    });
  }
}
