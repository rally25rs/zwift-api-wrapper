# Unversioned Changes (next version)

* [Issue 1](https://github.com/rally25rs/zwift-api-wrapper/issues/1) : Improve ZwiftPower auth by checking response header. If content is `text/html` when `application/json` was expected, reauthenticate.
* [Issue 1](https://github.com/rally25rs/zwift-api-wrapper/issues/1) : Improve Zwift auth. When Refresh Token is no longer valid, re-attempt standard authentication.

# v0.0.8

* [Issue 1](https://github.com/rally25rs/zwift-api-wrapper/issues/1) : Improve ZwiftPower auth and session timeout. Retry request once if first attempt seems to fail due to an expired session cookie.

# v0.0.7

* Clear ZwiftPower auth cookie on 401, so next request will try to reauthenticate.
* Add response status code to log messages.

# v0.0.6

* Add `isAuthenticated` to `ZwiftPowerAPI` and revise `ConnectionPool` to use it.

# v0.0.4

* Added `debug` option to `ConnectionPool` class.

# v0.0.3

* Added `ConnectionPool` class.

# v0.0.2

* Re-export types from `/types.ts` so library consumers don't have to use `/dist/types.d.ts` in their imports.

# v0.0.1

* Initial Pre-Release
