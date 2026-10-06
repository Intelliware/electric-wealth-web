# electric-wealth-web

The browser app for **Electric Wealth**, a Canadian retail wealth-management service. It's built with React, Vite and TypeScript. It covers the core of the mobile app: sign-in with MFA, dashboard, accounts, account detail (holdings, performance, transactions) and documents. It's bilingual (en-CA / fr-CA).

| Repo | Role |
|---|---|
| electric-wealth-db | Schema, migrations, seed data |
| electric-wealth-api | REST API. Owns the API contract (`openapi.json`) |
| **electric-wealth-web** (this repo) | Browser app. **Generates its API types from the API's `openapi.json`** |

## Getting started

Prerequisite: **Node.js 22.13+**. Clone the three repos side by side, then:

```bash
# Terminal 1: database + API
cd electric-wealth-db  && npm run db:reset
cd ../electric-wealth-api && npm install && npm run dev

# Terminal 2: web app
cd electric-wealth-web && npm install && npm run dev
```

Open http://localhost:5173 and sign in as `sarah.chen@example.com` / `Demo123!`, MFA code `123456`. The other personas are listed in the electric-wealth-db README.

The Vite dev server forwards `/api/*` to the API (default `http://localhost:4100`). Because the browser only ever talks to `localhost:5173`, no CORS setup is needed. To point at a different API, create `.env` with `API_URL=http://localhost:4200`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run gen:api` | Regenerate `src/api/schema.d.ts` from `../electric-wealth-api/openapi.json` |
| `npm run check:api` | Fail if `schema.d.ts` doesn't match the API's current `openapi.json` |
| `npm run typecheck` | Type-check the app |
| `npm run verify` | check:api + typecheck: the "ready to push" check |
| `npm run build` / `npm run preview` | Production build / serve the build locally |

## Working with the API contract

The API is the source of truth. This app never hand-writes request or response types:

```
electric-wealth-api/openapi.json ──(npm run gen:api)──▶ src/api/schema.d.ts ──▶ src/api/client.ts + hooks.ts
```

- **`src/api/schema.d.ts`** is generated. Don't edit it, but do commit it, so the app builds without the API repo and contract changes show up in PR diffs.
- **`src/api/client.ts`** is an [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/) client typed by `paths`. URLs, path and query parameters, request bodies and responses are all checked by TypeScript:

  ```ts
  api.GET('/api/wealth/accounts/{id}', { params: { path: { id } } }); // ✓
  api.GET('/api/wealth/acounts/{id}');                                // ✗ compile error: unknown path
  ```

- **`src/api/hooks.ts`** wraps each call in a TanStack Query hook (`useDashboard`, `useAccount`, ...). Components use the hooks and never call `fetch` directly.
- Use `Schemas['AccountSummary']` (from `client.ts`) when a component needs an API type.

**When the API changes:** pull the API repo, run `npm run gen:api`, then `npm run typecheck`. Every compile error is a place where the UI no longer matches the contract.

## How the code is organised

```
src/
  api/          generated schema, typed client, query hooks
  auth/         AuthContext (login → MFA → signed in, idle timeout, token refresh), tokenStore
  components/   Layout (top bar), ui (Card, Tag, Segmented, ...), charts (SVG, no chart library)
  features/     one folder per area: auth, dashboard, accounts, documents
  i18n/         en-CA.json / fr-CA.json (ported from the mobile app, plus a "web" section)
  lib/          formatting (money in cents, percent, dates) and deep-link mapping
  styles.css    design tokens from the mobile app theme; light + dark
```

## Notes

- **Money:** the API sends integers in minor units (cents). Always format with `formatMoney(minor, currency, locale)`.
- **Language:** the toggle in the top bar switches i18next, sends `Accept-Language` on API calls (so server labels are localized too), and saves the choice to `/api/preferences`.
- **Theme:** follows the user's saved preference (light / dark / system).
- **Deep links:** the API returns mobile-style links (`electricwealth://documents/d1`). `lib/deepLinks.ts` maps the ones the web supports. The rest show "Mobile app only".
- **Sessions:** tokens are kept in `sessionStorage`, so closing the tab signs you out. You're also signed out after 15 minutes without activity, and the access token is refreshed every 10 minutes while you're active.
