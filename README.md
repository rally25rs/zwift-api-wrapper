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
