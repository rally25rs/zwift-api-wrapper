/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import BaseApi from './baseApi';
import { RequestOptions } from 'https';
import { ZwiftAPIOptions, ZwiftActivities, ZwiftActivity, ZwiftActivityFeed, ZwiftActivityFitnessData, ZwiftAthleteFollow, ZwiftAuthToken, ZwiftEvent, ZwiftGameInfo, ZwiftNotification, ZwiftPowerProfile, ZwiftProfile } from './types';
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
export declare class ZwiftAPI extends BaseApi {
    private _authHost;
    private _apiHost;
    private _username;
    private _password;
    private _authToken;
    private _nextRefresh;
    private _options;
    constructor(options?: ZwiftAPIOptions);
    constructor(username: string, password: string, options?: ZwiftAPIOptions);
    authenticate(authToken?: ZwiftAuthToken): Promise<ZwiftAuthToken | undefined>;
    private _refreshToken;
    _schedRefresh(refreshAt: number): void;
    isAuthenticated(): boolean;
    fetch(urn: string, options?: ZwiftFetchOptions, headers?: RequestOptions['headers'], body?: string | undefined): Promise<{
        resp: import("http").IncomingMessage;
        data: string;
    }>;
    fetchPaged(urn: string, options?: ZwiftFetchPagedOptions, headers?: RequestOptions['headers']): Promise<any[]>;
    fetchJSON(urn: string, options?: ZwiftFetchOptions, headers?: RequestOptions['headers']): Promise<any>;
    getProfile(athleteId: string | number, options?: ZwiftFetchOptions): Promise<ZwiftProfile | undefined>;
    getPowerProfile(): Promise<ZwiftPowerProfile>;
    getActivities(athleteId: string | number): Promise<ZwiftActivities | undefined>;
    getActivity(id: string | number, fetchSnapshots?: boolean, fetchEvent?: boolean): Promise<ZwiftActivity | undefined>;
    getGameInfo(): Promise<ZwiftGameInfo>;
    searchProfiles(searchText: string, options?: {}): Promise<any[]>;
    getFollowing(athleteId: string | number, options?: {}): Promise<ZwiftAthleteFollow[]>;
    getFollowers(athleteId: string | number, options?: ZwiftFetchPagedOptions): Promise<ZwiftAthleteFollow[]>;
    setFollowing(them: string | number, us: string | number): Promise<any>;
    getNotifications(): Promise<ZwiftNotification[]>;
    getPrivateEventFeed(options?: {
        from?: string;
        to?: string;
    }): Promise<unknown[]>;
    getPrivateEvent(id: string | number): Promise<unknown>;
    getEventSubgroupResults(eventSubgroupId: string | number): Promise<any[]>;
    getEvent(id: string | number): Promise<ZwiftEvent>;
    getEventSubgroupEntrants(id: string | number): Promise<ZwiftProfile[]>;
    getActivityFitnessData(url: string): Promise<ZwiftActivityFitnessData>;
    eventSubgroupSignup(id: string | number): Promise<unknown>;
    getActivityFeed(): Promise<ZwiftActivityFeed[]>;
}
export {};
