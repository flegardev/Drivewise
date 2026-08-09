# DriveWise Security Review

Updated: 2026-08-09

## Release position

The API and dashboard security changes in `codex/portfolio-upgrade` are suitable
for review, but the mobile application is **not cleared for a new store release**.
Expo SDK 52's build graph still contains current high/critical advisories and
requires a separately tested SDK upgrade on Android and iOS.

## Verified controls

- Production API startup rejects a missing, short, or placeholder `JWT_SECRET`.
- Production API startup now rejects a missing or wildcard `CORS_ORIGIN`.
- Dashboard demo fallback is opt-in (`VITE_ENABLE_DEMO_FALLBACK=true`) instead
  of silently substituting fictional data after a real API outage.
- OSM/traffic imports plus provider/import logs require the `ADMIN` role.
- Ingestion coordinates and row limits reject non-finite and out-of-range input.
- Trip and child-resource access remains scoped to the owner or an administrator.
- Only `.env.example` templates are tracked; runtime secrets remain ignored.

## Current evidence

| Gate | Result |
|---|---|
| API production dependency audit | 0 vulnerabilities |
| Dashboard production dependency audit | 2 moderate React Router advisories; no high/critical findings |
| Whole monorepo production audit | 26 findings: 1 critical, 11 high, 14 moderate |
| Library/API unit tests | 54 passed |
| Disposable PostgreSQL HTTP E2E | 32 passed |
| API typecheck, lint, build | Passed |
| Dashboard typecheck, lint, production build | Passed |

The whole-monorepo findings resolve primarily through Expo/React Native build
tooling (`tar`, Metro `image-size`/`postcss`, and old transitive utilities).
`npm audit fix` reduced the initial 32 findings to 26 without a major upgrade.
The remaining critical/high path requires Expo's proposed major upgrade; the
forced repair changes Expo/React Native versions and cannot be accepted without
device/simulator, permissions, sensors, navigation, and store-build testing.

The dashboard's remaining React Router advisories require a major React Router 7
migration. The current SPA does not deserialize server hydration errors, but all
external navigation inputs should still be treated as untrusted until upgraded.

## Required before public production

1. Upgrade Expo/React Native on a dedicated branch and run Android/iOS device QA.
2. Upgrade React Router with route/login/navigation regression coverage.
3. Remove or rotate the seeded demo credentials before exposing the API.
4. Run the full clean Linux CI install/build because Windows `npm ci` exceeded
   the ten-minute local bound; local scoped API/dashboard gates passed.
5. Complete privacy/legal review, retention policy, monitoring, backups, and
   restore testing for real telematics data.
