/// <reference types="node" />
import type { ZwiftPowerActivityAnalysis, ZwiftPowerActivityResults, ZwiftPowerCriticalPowerProfile, ZwiftPowerEventResults, ZwiftPowerEventViewResults } from './types';
import { IncomingMessage } from 'http';
import BaseApi from './baseApi';
export declare class ZwiftPowerAPI extends BaseApi {
    private _username;
    private _password;
    constructor();
    constructor(username: string, password: string);
    getAuthenticated(url: string, body?: string | undefined, options?: {}): Promise<{
        resp: IncomingMessage;
        data: string;
    }>;
    private _doLoginSubmit;
    authenticate(cookies?: string): Promise<string>;
    private _haveAuthCookie;
    getCriticalPowerProfile(athleteId: string | number, eventId?: string | number, type?: string): Promise<ZwiftPowerCriticalPowerProfile | undefined>;
    getEventResults(eventId: string): Promise<ZwiftPowerEventResults | undefined>;
    getEventViewResults(eventId: string): Promise<ZwiftPowerEventViewResults | undefined>;
    getActivityResults(athleteId: string | number): Promise<ZwiftPowerActivityResults | undefined>;
    getActivityAnalysis(eventId: string | number, athleteId: string | number): Promise<ZwiftPowerActivityAnalysis | undefined>;
}
