/// <reference types="node" />
import type { ZwiftAPIWrapperResponse, ZwiftPowerActivityAnalysis, ZwiftPowerActivityResults, ZwiftPowerCriticalPowerProfile, ZwiftPowerEventResults, ZwiftPowerEventViewResults } from './types';
import https from 'https';
import BaseApi from './baseApi';
export declare class ZwiftPowerAPI extends BaseApi {
    private _username;
    private _password;
    constructor();
    constructor(username: string, password: string);
    getAuthenticated(url: string, body?: string | undefined, options?: https.RequestOptions, isRetry?: boolean): Promise<ZwiftAPIWrapperResponse<string>>;
    private _doLoginSubmit;
    private _fixRedirect;
    authenticate(cookies?: string): Promise<string>;
    isAuthenticated(): Promise<boolean>;
    getCriticalPowerProfile(athleteId: string | number, eventId?: string | number, type?: string): Promise<ZwiftAPIWrapperResponse<ZwiftPowerCriticalPowerProfile>>;
    getEventResults(eventId: string): Promise<ZwiftAPIWrapperResponse<ZwiftPowerEventResults>>;
    getEventViewResults(eventId: string): Promise<ZwiftAPIWrapperResponse<ZwiftPowerEventViewResults>>;
    getActivityResults(athleteId: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftPowerActivityResults>>;
    getActivityAnalysis(eventId: string | number, athleteId: string | number): Promise<ZwiftAPIWrapperResponse<ZwiftPowerActivityAnalysis>>;
}
