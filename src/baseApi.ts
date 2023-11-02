import https, { RequestOptions } from 'https';
import { IncomingMessage } from 'http';
import { CookieJar } from 'tough-cookie';

export default class BaseApi {
  protected _cookieJar: CookieJar;

  constructor() {
    this._cookieJar = new CookieJar();
  }

  async setCookies(cookies: string) {
    this._cookieJar = await CookieJar.deserializeSync(cookies);
  }

  request(
    url: string,
    body: string | undefined = undefined,
    options: RequestOptions = {}
  ): Promise<{resp: IncomingMessage, data: string}> {
    return new Promise((resolve, reject) => {
      const cookies = this._cookieJar.getCookieStringSync(url);
      options.headers = options.headers || {};
      if (cookies && options.headers?.Cookie) {
        options.headers.Cookie += '; ' + cookies;
      } else if (cookies) {
        options.headers.Cookie = cookies;
      }
      options.port = options.port || 443;
      options.headers['content-length'] = body ? Buffer.byteLength(body) : 0;
      options.method = options.method || (body ? 'POST' : 'GET');

      const req = https.request(url, options, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          if (resp.headers['set-cookie']) {
            if (typeof resp.headers['set-cookie'] === 'string') {
              this._cookieJar.setCookie(resp.headers['set-cookie'], url);
            } else {
              resp.headers['set-cookie'].forEach(cookie => {
                this._cookieJar.setCookie(cookie, url);
              });
            }
          }
          resolve({resp, data});
        });
      });
      
      req.on("error", (err) => {
        console.error(`Error [${url}]: ${err.message}`);
        reject(err);
      });

      if(body) {
        req.write(body);
      }
      req.end();
    });
  }
}
