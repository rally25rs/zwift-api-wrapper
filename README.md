# zwift-api-wrapper

API Wrappers for calling Zwift and ZwiftPower APIs.

Requires a valid Zwift login.

## Attributions

Some Zwift API code borrowed from the [Sauce4Zwift](https://github.com/SauceLLC/sauce4zwift) project. Please support them!

## Runtime Support

This library uses the nodejs `https` module to communicate with the Zwift and ZwiftPower APIs, so is not compatible with Deno or Bun at this time.

## Usage

The Zwift and ZwiftPower APIs are split into 2 classes, so you can authenticate to them independently as needed.

```
import { ZwiftAPI, ZwiftPowerAPI } from '@codingwithspike/zwift-api-wrapper';

const zwiftApi = new ZwiftAPI(zwiftUsername, zwiftPassword);
const zwiftAuthCreds = await zwiftApi.authenticate();
const profile = await zwiftApi.getProfile(athleteId);

const zwiftPowerApi = new ZwiftPowerAPI(process.env.ZWIFT_USER as string, process.env.ZWIFT_PASS as string);
const zwiftPowerAuthCreds = await zwiftPowerApi.authenticate();
const eventResults = await zwiftPowerApi.getEventResults(eventId);
```

### Authentication

Both classes have an async `authenticate()` method that returns the credentials for that API as a string. These strings can be re-passed to `authenticate()` on another API instance to persist login if needed. This is primarily to facilitate using this library on a stateless server without having to re-authenticate to Zwift for every request.

```
// authenticate to one instance
const zwiftApi = new ZwiftAPI(zwiftUsername, zwiftPassword);
const zwiftAuthCreds = await zwiftApi.authenticate();
const profile = await zwiftApi.getProfile(athleteId);

// reuse the creds instead of username/pwd
const zwiftApi = new ZwiftAPI(); // no need to pass user/pwd as long as creds will be passed to authenticate
const zwiftAuthCreds = await zwiftApi.authenticate(zwiftAuthCreds); // pass previous creds here
const profile = await zwiftApi.getProfile(athleteId);
```

### API Responses

To provide some level of consistency across APIs, most methods will return a type `ZwiftAPIWrapperResponse<T>`.
The `ZwiftAPIWrapperResponse` type has the properties:

* `statusCode: number` : The HTTP response status code from Zwift/ZwiftPower, or 0 if there was a network error or internal exception.
* `error?: string` : In the case of an exception, this will contain the exception message. It may sometimes contain the response from Zwift/ZwiftPower if a non-success statusCode was returned.
* `body: T | undefined` : The response from the Zwift/ZwiftPower API, usually JSON parsed to an object of type `T`. This may sometimes be a raw `string` instead of `T` if there was an error JSON parsing the API response, or if the Zwift/ZwiftPower API did not return JSON as its response. The `body` can always potentially be `undefined` because the server could return a `404 Not Found`, in which case `statusCode` will be `404` and `body` will be `undefined`.

### Missing API Calls

Not all API calls in Zwift and ZwiftPower are in this library yet. I have just been ading them as needed. Some TypeScript definitions are also missing. Please contribute a PR if you want to add more calls with known type definitions.

If you need to query something that is missing, both API classes provide a method for doing so.

In the `ZwiftAPI` you can use `.fetchJSON<T>(url: string): Promise<ZwiftAPIWrapperResponse<T>>`
```
const api = new ZwiftAPI(username, password);
await api.authenticate();
const whatever = api.fetchJSON<SomeZwiftObject>('/some/api/call');
```

In the `ZwiftPowerAPI` you can use `.getAuthenticated(url: string): Promise<ZwiftAPIWrapperResponse<string>>`
```
const api = new ZwiftPowerAPI(username, password);
await api.authenticate();
const response = api.getAuthenticated('/some/api/call');
const whatever = JSON.parse(response.body);
```

## Jank

The `ZwiftAPI` and `ZwiftPowerAPI` classes in this library were originally written independently, then combined into this 1 library, so they behave slightly different, and method names are not consistent. Sorry. Future updates will likely drive toward more consistent behavior.

The Zwift API is pretty good and fast. You can tell it was designed to be used outside Zwift.
The ZwiftPower API is incinsistent, slower, and the responses are clearly geared toward just being displayed in the data tables on the ZwiftPower website. Half the website is server-rendered so no API is available for some of the data.
If the same data is available in both APIs, using the Zwift API is advised.

Error handling in this wrapper library is not great. HTTP errors are hard to handle in general, especially between 2
APIs. Sometimes servers may respons with string error messages instead of JSON, or the error JSON might not be the same between different endpoints.
When consuming this library, you should check the `statusCode` responses and assume that either `error` or `body` will have a meaningful message.
If the `statusCode` is a "success" (statusCode < 400) then `body` is likely whatever type TypeScript indicates. For errors (statusCode >= 400) `body` may just be a `string` of whatever the server returned. For example ZwiftPower will sometimes return a `500` status with a string PHP error message, isntead of JSON. If this happens, this library will try to shift that string message over to the `error` property instead of `body`, but it might end up in both fields in some cases.

Authentication to each API is different.
ZwiftPower uses SSO/OAuth through Zwift, so at least the same username and password work for both, but is also very slow as it takes a few round-trips to set up the authentication.
Since you may want to only use one API or the other, you have to call `.authenticate()` on both individually.
Zwift API uses an auth token that can be reused between API calls.
ZwiftPower is less convenient, using session cookies that need to be attached to the HTTP calls.
The credentials for each API also expire seperately and have different renewal mechanisms.

## Typescript

This library is built in TS and is published with the type definitions.

## Contributing

Project Setup
```
git clone {your fork url}
cd zwift-api-wrapper
yarn install
```

Run tests
```
yarn test
```

Build
```
yarn build
```

Update `CHANGELOG.md` and add your changes to the "Unversioned Changes" section.

git commit, push, and open a PR.
