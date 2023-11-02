"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZwiftPowerAPI = void 0;
const assert_1 = __importDefault(require("assert"));
const baseApi_1 = __importDefault(require("./baseApi"));
function _toJSON(data) {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        console.error(`Error parsing JSON`);
        console.error(data);
        throw e;
    }
}
class ZwiftPowerAPI extends baseApi_1.default {
    _username = '';
    _password = '';
    constructor(username, password) {
        super();
        if (username && password) {
            this._username = username;
            this._password = password;
        }
    }
    async getAuthenticated(url, body = undefined, options = {}) {
        if (!await this._haveAuthCookie()) {
            await this.authenticate();
        }
        return await this.request(url, body, options);
    }
    // Submit Zwift login form
    async _doLoginSubmit(url, options = {}, username, password) {
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
    async authenticate(cookies) {
        if (cookies) {
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
        (0, assert_1.default)(leg1Location, `Expected location header`);
        const leg2response = await this.request(leg1Location);
        let leg3Location;
        if (leg2response.resp.statusCode === 200) {
            const loginSubmitUrl = leg2response.data.match(/<form .* action="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
            (0, assert_1.default)(loginSubmitUrl, `Expected login submit URL`);
            const loginSubmitResponse = await this._doLoginSubmit(loginSubmitUrl, {}, this._username, this._password);
            if (loginSubmitResponse.resp.statusCode !== 302) {
                throw new Error(`Expected 302 got ${loginSubmitResponse.resp.statusCode}`);
            }
            leg3Location = loginSubmitResponse.resp.headers['location'];
        }
        else if (leg2response.resp.statusCode === 302) {
            leg3Location = leg2response.resp.headers['location'];
        }
        else {
            throw new Error(`Expected 200 or 302 got ${leg2response.resp.statusCode}`);
        }
        (0, assert_1.default)(leg3Location, `Expected location header`);
        const leg3response = await this.request(leg3Location);
        if (leg3response.resp.statusCode !== 302) {
            throw new Error(`Expected 302 got ${leg3response.resp.statusCode}`);
        }
        return JSON.stringify(await this._cookieJar.serialize());
    }
    async _haveAuthCookie() {
        const cookies = await this._cookieJar.getCookies('https://zwiftpower.com/', { allPaths: true, expire: true });
        return !!cookies.find(c => c.key === 'phpbb3_lswlk_sid');
    }
    async getCriticalPowerProfile(athleteId, eventId = '', type = 'watts') {
        const url = `https://zwiftpower.com/api3.php?do=critical_power_profile&zwift_id=${encodeURIComponent(athleteId)}&zwift_event_id=${eventId}&type=${type}`;
        const result = await this.getAuthenticated(url);
        if (result.resp.statusCode !== 200) {
            console.error(`getCriticalPowerProfile(${athleteId}) expected 200 got ${result.resp.statusCode}`);
            return undefined;
        }
        return _toJSON(result.data);
    }
    async getEventResults(eventId) {
        const url = `https://zwiftpower.com/cache3/results/${eventId}_zwift.json`;
        const result = await this.getAuthenticated(url);
        if (result.resp.statusCode !== 200) {
            console.error(`getEventResults(${eventId}) expected 200 got ${result.resp.statusCode}`);
            return undefined;
        }
        return _toJSON(result.data);
    }
    async getEventViewResults(eventId) {
        const url = `https://zwiftpower.com/cache3/results/${eventId}_view.json`;
        const result = await this.getAuthenticated(url);
        if (result.resp.statusCode !== 200) {
            console.error(`getEventViewResults(${eventId}) expected 200 got ${result.resp.statusCode}`);
            return undefined;
        }
        return _toJSON(result.data);
    }
    // Recent activities for this athlete.
    async getActivityResults(athleteId) {
        const url = `https://zwiftpower.com/cache3/profile/${athleteId}_all.json`;
        const result = await this.getAuthenticated(url);
        if (result.resp.statusCode !== 200) {
            console.error(`getActivityResults(${athleteId}) expected 200 got ${result.resp.statusCode}`);
            return undefined;
        }
        return _toJSON(result.data);
    }
    async getActivityAnalysis(eventId, athleteId) {
        const url = `https://zwiftpower.com/api3.php?do=analysis&zwift_id=${athleteId}&zwift_event_id=${eventId}`;
        const result = await this.getAuthenticated(url);
        if (result.resp.statusCode !== 200) {
            console.error(`getActivityAnalysis(${eventId}, ${athleteId}) expected 200 got ${result.resp.statusCode}`);
            return undefined;
        }
        return _toJSON(result.data);
    }
}
exports.ZwiftPowerAPI = ZwiftPowerAPI;
