/// <reference types="node" />
/// <reference types="node" />
import BaseApi from './baseApi';
import { RequestOptions } from 'https';
import { ZwiftAPIOptions, ZwiftAPIWrapperResponse, ZwiftActivities, ZwiftActivity, ZwiftActivityFeed, ZwiftActivityFitnessData, ZwiftAthleteFollow, ZwiftAuthToken, ZwiftEvent, ZwiftGameInfo, ZwiftNotification, ZwiftProfilePowerCurve, ZwiftProfile } from './types';
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
    fetch<T = unknown>(urn: string, options?: ZwiftFetchOptions, headers?: RequestOptions['headers'], body?: string | undefined): Promise<ZwiftAPIWrapperResponse<string>>;
    fetchPaged<T extends Array<any>>(urn: string, options?: ZwiftFetchPagedOptions, headers?: RequestOptions['headers']): Promise<ZwiftAPIWrapperResponse<T>>;
    fetchJSON<T = unknown>(urn: string, options?: ZwiftFetchOptions, headers?: RequestOptions['headers']): Promise<ZwiftAPIWrapperResponse<T>>;
    getProfile(athleteId: string | number, options?: ZwiftFetchOptions): Promise<ZwiftAPIWrapperResponse<ZwiftProfile>>;
    getPowerProfile(): Promise<ZwiftAPIWrapperResponse<ZwiftProfilePowerCurve>>;
    getActivities(athleteId: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftActivities>>;
    getActivity(id: string | number, fetchSnapshots?: boolean, fetchEvent?: boolean): Promise<ZwiftAPIWrapperResponse<ZwiftActivity>>;
    getGameInfo(): Promise<ZwiftAPIWrapperResponse<ZwiftGameInfo>>;
    searchProfiles(searchText: string, options?: {}): Promise<ZwiftAPIWrapperResponse<any[]>>;
    getFollowing(athleteId: string | number, options?: {}): Promise<ZwiftAPIWrapperResponse<ZwiftAthleteFollow[]>>;
    getFollowers(athleteId: string | number, options?: ZwiftFetchPagedOptions): Promise<ZwiftAPIWrapperResponse<ZwiftAthleteFollow[]>>;
    setFollowing(them: string | number, us: string | number): Promise<ZwiftAPIWrapperResponse<unknown>>;
    getNotifications(): Promise<ZwiftAPIWrapperResponse<ZwiftNotification[]>>;
    getPrivateEventFeed(options?: {
        from?: string;
        to?: string;
    }): Promise<ZwiftAPIWrapperResponse<unknown[]>>;
    getPrivateEvent(id: string | number): Promise<ZwiftAPIWrapperResponse<unknown>>;
    getEventSubgroupResults(eventSubgroupId: string | number): Promise<ZwiftAPIWrapperResponse<unknown[]>>;
    getEvent(id: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftEvent>>;
    getEventSubgroupEntrants(id: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftProfile[]>>;
    getActivityFitnessData(url: string): Promise<ZwiftAPIWrapperResponse<ZwiftActivityFitnessData>>;
    eventSubgroupSignup(id: string | number): Promise<ZwiftAPIWrapperResponse<unknown>>;
    getActivityFeed(): Promise<ZwiftAPIWrapperResponse<ZwiftActivityFeed[]>>;
}
export {};
