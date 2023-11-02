"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZwiftAPI = void 0;
const assert_1 = __importDefault(require("assert"));
const baseApi_1 = __importDefault(require("./baseApi"));
const DEFAULT_REQUEST_TIMEOUT = 30000;
function toUrlSearchParams(query) {
    if (query && !(query instanceof URLSearchParams)) {
        const searchParams = Object.entries(query).reduce((acc, [k, v]) => {
            acc[k] = v !== undefined && v !== null ? v.toString() : "";
            return acc;
        }, {});
        return new URLSearchParams(searchParams);
    }
    return query || new URLSearchParams();
}
class ZwiftAPI extends baseApi_1.default {
    _authHost = 'secure.zwift.com';
    _apiHost = 'us-or-rly101.zwift.com';
    _username = '';
    _password = '';
    _authToken = undefined;
    _nextRefresh = undefined;
    _options = {};
    constructor(usernameOrOptions, password, options) {
        super();
        if (!usernameOrOptions) {
            this._options = {};
        }
        else if (typeof usernameOrOptions === 'object') {
            this._options = usernameOrOptions;
        }
        else {
            this._username = usernameOrOptions;
            this._password = password || '';
            this._options = options || {};
        }
    }
    async authenticate(authToken) {
        if (authToken) {
            this._authToken = authToken;
            if (this._authToken?.access_token && (this._authToken?.expires_at || 0) > new Date().getTime()) {
                return;
            }
        }
        if ((this._authToken?.expires_at || 0) <= new Date().getTime() && this._authToken?.refresh_token) {
            this._refreshToken();
        }
        else if (this._username && this._password) {
            const r = await this.fetch("/auth/realms/zwift/protocol/openid-connect/token", {
                host: this._authHost,
                noAuth: true,
                method: "POST",
                ok: [200, 401],
            }, {
                accept: "application/json",
            }, new URLSearchParams({
                client_id: "Zwift Game Client",
                grant_type: "password",
                password: this._password,
                username: this._username,
            }).toString());
            const resp = r.data ? JSON.parse(r.data) : undefined;
            if (r.resp.statusCode === 401) {
                throw new Error(resp.error_description || "Login failed");
            }
            this._authToken = {
                access_token: resp.access_token,
                refresh_token: resp.refresh_token,
                expires_at: resp.expires_in * 1000 + Date.now(),
            };
            (0, assert_1.default)(this._authToken, "Auth token not set");
            this._schedRefresh(this._authToken.expires_at - 10000);
        }
        else {
            throw new Error('Login credentials not set');
        }
        return this._authToken;
    }
    async _refreshToken() {
        if (!this._authToken) {
            console.warn("No auth token to refresh");
            return false;
        }
        const r = await this.fetch("/auth/realms/zwift/protocol/openid-connect/token", {
            host: this._authHost,
            noAuth: true,
            method: "POST",
        }, {
            accept: "application/json",
        }, new URLSearchParams({
            client_id: "Zwift Game Client",
            grant_type: "refresh_token",
            refresh_token: this._authToken.refresh_token,
        }).toString());
        const resp = r.data ? JSON.parse(r.data) : undefined;
        this._authToken = {
            access_token: resp.access_token,
            refresh_token: resp.refresh_token,
            expires_at: resp.expires_in * 1000 + Date.now(),
        };
        (0, assert_1.default)(this._authToken, "Auth token not set");
        this._schedRefresh(this._authToken.expires_at - 10000);
    }
    _schedRefresh(refreshAt) {
        if (this._options?.autoRefreshAuth) {
            const delay = refreshAt - Date.now();
            clearTimeout(this._nextRefresh);
            this._nextRefresh = setTimeout(this._refreshToken.bind(this), Math.min(0x7fffffff, delay));
        }
    }
    isAuthenticated() {
        return !!(this._authToken?.access_token);
    }
    async fetch(urn, options = {}, headers = {}, body = undefined) {
        headers = headers || {};
        if (!options.noAuth) {
            if (!this.isAuthenticated()) {
                throw new TypeError("Auth token not set");
            }
            (0, assert_1.default)(this._authToken, "Auth token not set");
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
            "User-Agent": "CNL/3.30.8 (macOS 13 Ventura; Darwin Kernel 22.4.0) zwift/1.0.110983 curl/7.78.0",
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
        }
        finally {
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
    async fetchPaged(urn, options = {}, headers) {
        const results = [];
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
    async fetchJSON(urn, options = {}, headers = {}) {
        headers.accept = "application/json";
        const r = await this.fetch(urn, options, headers);
        if (r.resp.statusCode === 204) {
            return;
        }
        return JSON.parse(r.data);
    }
    async getProfile(athleteId, options = {}) {
        try {
            return await this.fetchJSON(`/api/profiles/${athleteId}`, options);
        }
        catch (e) {
            if (e.status === 404) {
                return;
            }
            throw e;
        }
    }
    async getPowerProfile() {
        return await this.fetchJSON(`/api/power-curve/power-profile`);
    }
    async getActivities(athleteId) {
        try {
            return await this.fetchJSON(`/api/profiles/${athleteId}/activities`);
        }
        catch (e) {
            if (e.status === 404) {
                return;
            }
            throw e;
        }
    }
    async getActivity(id, fetchSnapshots = false, fetchEvent = false) {
        try {
            return await this.fetchJSON(`/api/activities/${id}?fetchSnapshots=${fetchSnapshots ? 'true' : 'false'}&fetchEvent=${fetchEvent ? 'true' : 'false'}`);
        }
        catch (e) {
            if (e.status === 404) {
                return;
            }
            throw e;
        }
    }
    async getGameInfo() {
        return await this.fetchJSON(`/api/game_info`, { apiVersion: "2.7" });
    }
    async searchProfiles(searchText, options = {}) {
        return await this.fetchPaged("/api/search/profiles", {
            method: "POST",
            json: { query: searchText },
            ...options,
        });
    }
    async getFollowing(athleteId, options = {}) {
        return await this.fetchPaged(`/api/profiles/${athleteId}/followees`, options);
    }
    async getFollowers(athleteId, options = {}) {
        return await this.fetchPaged(`/api/profiles/${athleteId}/followers`, options);
    }
    async setFollowing(them, us) {
        return await this.fetchJSON(`/api/profiles/${us}/following/${them}`, {
            method: "POST",
            json: {
                followeeId: them,
                followerId: us,
            },
        });
    }
    async getNotifications() {
        return await this.fetchJSON(`/api/notifications`);
    }
    async getPrivateEventFeed(options = {}) {
        const start_date = options.from; // always see this used
        const end_date = options.to; // never see this used
        const query = { organizer_only_past_events: false, start_date, end_date };
        return await this.fetchJSON("/api/private_event/feed", { query });
    }
    async getPrivateEvent(id) {
        return await this.fetchJSON(`/api/private_event/${id}`);
    }
    async getEventSubgroupResults(eventSubgroupId) {
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
    async getEvent(id) {
        return await this.fetchJSON(`/api/events/${id}`);
    }
    async getEventSubgroupEntrants(id) {
        const entrants = [];
        const limit = 100;
        let start = 0;
        while (true) {
            const data = await this.fetchJSON(`/api/events/subgroups/entrants/${id}`, {
                query: {
                    type: "all",
                    participation: "signed_up",
                    limit,
                    start,
                },
            });
            entrants.push(...data);
            if (data.length < limit) {
                break;
            }
            start += data.length;
        }
        return entrants;
    }
    async getActivityFitnessData(url) {
        return await this.fetchJSON(url);
    }
    async eventSubgroupSignup(id) {
        return await this.fetchJSON(`/api/events/subgroups/signup/${id}`, {
            method: "POST",
        });
    }
    async getActivityFeed() {
        return await this.fetchJSON("/api/activity-feed/feed/", {
            query: {
                limit: 30,
                includeInProgress: false,
                feedType: "JUST_ME",
            },
        });
    }
}
exports.ZwiftAPI = ZwiftAPI;
