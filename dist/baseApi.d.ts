/// <reference types="node" />
/// <reference types="node" />
import { RequestOptions } from 'https';
import { IncomingMessage } from 'http';
import { CookieJar } from 'tough-cookie';
export default class BaseApi {
    protected _cookieJar: CookieJar;
    constructor();
    setCookies(cookies: string): Promise<void>;
    request(url: string, body?: string | undefined, options?: RequestOptions): Promise<{
        resp: IncomingMessage;
        data: string;
    }>;
}
