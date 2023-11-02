"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const tough_cookie_1 = require("tough-cookie");
class BaseApi {
    _cookieJar;
    constructor() {
        this._cookieJar = new tough_cookie_1.CookieJar();
    }
    async setCookies(cookies) {
        this._cookieJar = await tough_cookie_1.CookieJar.deserializeSync(cookies);
    }
    request(url, body = undefined, options = {}) {
        return new Promise((resolve, reject) => {
            const cookies = this._cookieJar.getCookieStringSync(url);
            options.headers = options.headers || {};
            if (cookies && options.headers?.Cookie) {
                options.headers.Cookie += '; ' + cookies;
            }
            else if (cookies) {
                options.headers.Cookie = cookies;
            }
            options.port = options.port || 443;
            options.headers['content-length'] = body ? Buffer.byteLength(body) : 0;
            options.method = options.method || (body ? 'POST' : 'GET');
            const req = https_1.default.request(url, options, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    if (resp.headers['set-cookie']) {
                        if (typeof resp.headers['set-cookie'] === 'string') {
                            this._cookieJar.setCookie(resp.headers['set-cookie'], url);
                        }
                        else {
                            resp.headers['set-cookie'].forEach(cookie => {
                                this._cookieJar.setCookie(cookie, url);
                            });
                        }
                    }
                    resolve({ resp, data });
                });
            });
            req.on("error", (err) => {
                console.error(`Error [${url}]: ${err.message}`);
                reject(err);
            });
            if (body) {
                req.write(body);
            }
            req.end();
        });
    }
}
exports.default = BaseApi;
