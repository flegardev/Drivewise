# DriveWise Local Repair and Screenshot Report

## What was broken

- `docker compose up -d` could not start PostgreSQL because Docker Desktop's Linux engine was not running (`dockerDesktopLinuxEngine` pipe missing).
- `node_modules/@drivewise/*` workspace junctions pointed to an old `Downloads\hiii\...` path, causing repo-level typecheck and Jest tests to fail resolving `@drivewise/shared`.
- The dashboard assumed the API at `localhost:3000` was usable. On this machine another service answered there without the expected CORS headers, producing browser console errors.
- Starting the dashboard through the root script with extra Vite flags was unreliable, and port `5173` was already used by another local project.
- Login labels were visible but not associated with form inputs, which hurt accessibility and browser automation.
- The dashboard UI looked functional but rough: duplicate overview metrics, emoji-style navigation, weak local-demo state, and less polished card/table/form spacing.

## What I fixed

- Refreshed workspace dependencies with `npm install`, repairing local package junctions.
- Added an explicit local demo mode for the dashboard via `apps/dashboard/.env.local`.
- Added a dashboard demo API layer that supports login, users, trips, trip detail, score breakdown, simulation, reports, risk map, roads, traffic, and data-source status without a live backend.
- Updated the dashboard API client so local demo mode short-circuits network calls instead of probing `localhost:3000`.
- Improved dashboard shell, cards, buttons, tables, login form, and overview page presentation.
- Added React Router future flags to remove dev-console warnings.
- Ran the app on `http://127.0.0.1:5174` to avoid the occupied `5173` port.
- Captured three real desktop screenshots from the running app at a 1440px-wide viewport.

## Files changed

- `apps/dashboard/.env.local`
- `apps/dashboard/src/api/client.ts`
- `apps/dashboard/src/api/demo.ts`
- `apps/dashboard/src/components/Layout.tsx`
- `apps/dashboard/src/index.css`
- `apps/dashboard/src/main.tsx`
- `apps/dashboard/src/pages/LoginPage.tsx`
- `apps/dashboard/src/pages/OverviewPage.tsx`
- `package-lock.json` and workspace links refreshed by `npm install`
- `_final_desktop_screenshots/01-main-dashboard-or-home.png`
- `_final_desktop_screenshots/02-key-feature.png`
- `_final_desktop_screenshots/03-detail-or-secondary-screen.png`

## Commands used

```powershell
docker compose up -d
npm run build --workspace=apps/dashboard
npm run dev --workspace=apps/dashboard --host 127.0.0.1
npm install
npm run typecheck
npm run test
npm run lint
npm run build
cd apps/dashboard
npm run dev -- --host 127.0.0.1 --port 5174
```

I also used a Playwright browser script against `http://127.0.0.1:5174` to log in, navigate, verify visible screens, collect console issues, and save screenshots.

## Env and demo setup

- Existing root `.env` and `apps/api/.env` were preserved.
- Added `apps/dashboard/.env.local`:

```env
VITE_USE_LOCAL_DEMO=true
```

- Demo login:
  - Email: `admin@drivewise.si`
  - Password: `admin1234`

To use the real API instead of dashboard demo data, set `VITE_USE_LOCAL_DEMO=false`, start Docker Desktop, run the database setup, then start the API and dashboard.

## Verification results

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed.
- `npm run build` passed, including Prisma generation, API build, dashboard build, package builds, and Expo export.
- Browser verification passed with zero console warnings/errors on the final screenshot run.
- Visual screenshot check confirmed all three PNGs are real running app screens, not blank pages or browser error pages.

## Screenshots saved

- `_final_desktop_screenshots/01-main-dashboard-or-home.png`
- `_final_desktop_screenshots/02-key-feature.png`
- `_final_desktop_screenshots/03-detail-or-secondary-screen.png`

## Remaining issues

- Docker Desktop is installed but was not running, so PostgreSQL migrations/seeds were not run against a live local database in this session.
- The dashboard currently defaults to local demo mode through `apps/dashboard/.env.local`.
- `npm install` reports 17 dependency vulnerabilities from the existing dependency tree. I did not run `npm audit fix` because it can introduce unrelated breaking upgrades.
- A small `_run_logs` folder remains while the dev server is running on port `5174`.

## Exact commands to run again

Demo dashboard only:

```powershell
cd C:\Users\tinif\Documents\drivewise-main\drivewise-main
npm install
cd apps\dashboard
npm run dev -- --host 127.0.0.1 --port 5174
```

Then open:

```text
http://127.0.0.1:5174
```

Full backend setup when Docker Desktop is running:

```powershell
cd C:\Users\tinif\Documents\drivewise-main\drivewise-main
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev:api
```

In another terminal:

```powershell
cd C:\Users\tinif\Documents\drivewise-main\drivewise-main\apps\dashboard
Set-Content .env.local "VITE_USE_LOCAL_DEMO=false"
npm run dev -- --host 127.0.0.1 --port 5174
```
