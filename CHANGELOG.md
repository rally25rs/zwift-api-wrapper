# Unversioned Changes (next version)

* (none)

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
