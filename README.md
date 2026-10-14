# SubTrack

A personal subscription workspace built with React, TypeScript, Vite, and Tailwind. The interface keeps the original indigo/blue palette with a quieter layout, a searchable subscription list, billing calendar, and spending forecasts.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Choose **Login for demo** to explore without an account, Gmail permissions, or a running backend.

## Demo workspace

The demo starts with seven illustrative subscriptions and sample receipt history. It is created once per browser and stays saved after reload or sign-out.

The app follows the email flow: connect Gmail, automatically retrieve subscriptions, then view their prices and billing dates. Subscription data is read-only; there are no manual add, edit, or delete controls. The overview shows a monthly total, the next payment, and one searchable list. Extra receipt details open on demand.

Overview, Calendar, Insights, and Settings share one workspace. Annual plans use their monthly equivalent in spending totals and their full amount in the renewal month's payment forecast.

### Keeping your details

- Subscriptions and receipt history are saved to `localStorage` under `subtrack.demo.v1`, with **no expiry**. Previously stored details are retained for compatibility.
- Reloading, navigating, signing out, and logging into the demo again do not reset the workspace. An intentionally empty workspace stays empty.
- The original billing date remains saved. Upcoming dates are projected from it when the app opens and periodically while it stays open, including month-end and leap-year renewals.
- Stored demo receipt history keeps its original dates and amounts.
- Browser storage is specific to the site's origin and browser profile. Clearing site data, private browsing, or changing devices can remove access. This frontend does not promise permanent cloud storage.
- In **Settings → Saved data and backups**, use **Export backup** to keep a JSON copy. **Restore backup** validates the file and asks before replacing the saved data. These tools are collapsed by default to keep the email connection screen simple.
- If browser storage is unavailable, an on-screen message explains that changes only remain in the current tab. Unreadable saved data is retained instead of being silently replaced.

Demo prices and receipts are illustrative, not live provider pricing. Demo mode does not fetch data from Gmail or the backend. Forecasts are scheduled estimates, not verified bank transactions.

## Backend connection

Google login and Gmail scanning require a configured backend. Copy `.env.example` to `.env` and set `VITE_API_URL` to its API base URL.

The existing integration uses these endpoints:

- `GET /auth/google/login`: backend-owned Google sign-in; redirect to the frontend with `?token=...` after authentication.
- `GET /gmail/connect/redirect`: backend-owned Gmail authorization.
- `POST /gmail/callback`: exchange the authorization code and state.
- `GET /subscriptions`: return the subscription array defined in `src/app/services/api.ts`.

The account workspace is stored separately from demo data. Successful refreshes use the subscriptions returned by the backend, including changed prices, billing dates, new services, and removed services. Network failures or invalid responses keep cached data available. Demo data is unaffected by real email refreshes. The current workspace uses USD; imports with other currencies are rejected rather than added to misleading totals.

Without a configured backend, Google sign-in explains how to use the demo. Gmail callbacks only report success after the backend confirms it.

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) and [backend-examples](./backend-examples) for the original backend examples. Those examples describe earlier scaffolding; use the endpoint contracts above for the current frontend.

## Verification

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Browser tests cover read-only subscription screens, email-driven updates, demo persistence, sign-out/re-entry, backup restoration, malformed storage, real-account caching, responsive layouts, and future dates. Billing tests cover month-end dates, leap years, and annual cost normalization.

When deploying, configure your host to serve `index.html` for app routes such as `/app/calendar` so that direct links and refreshes work.
