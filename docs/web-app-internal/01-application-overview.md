---
title: "Application Overview"
block: reverse-eng/web-app/internal/application-overview
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 1. Application Overview

### 1.1 What This Application Is

- **Name:** Electric Wealth Web App — npm package `electric-wealth-web@0.1.0`, `private: true` ([package.json](../../package.json))
- **Purpose:** The browser portal for Electric Wealth retail investors. Signed-in clients see their portfolio, accounts,
  documents, goals, market data and learning content, book and message their advisor, and manage their profile and
  settings. Existing clients without online access can enrol themselves (`/register`).
- **Type:** Client-side rendered single-page application (React 19, Vite 8). No server-side rendering, no backend of its
  own: every piece of data comes from the Spring API (`electric-wealth-api-spring`) through the Vite dev proxy at `/api`
  ([vite.config.ts](../../vite.config.ts)).
- **Lineage:** Ported from a mobile app (`mobile/`, not in this workspace). Comments in
  [hooks.ts](../../src/api/hooks.ts), [format.ts](../../src/lib/format.ts), [ui.tsx](../../src/components/ui.tsx),
  [i18n/index.ts](../../src/i18n/index.ts) and [AuthContext.tsx](../../src/auth/AuthContext.tsx) say "same pattern as
  mobile". The locale files still carry mobile-only sections (`tabs`, `more`, `change`), and the API's deep links
  use the mobile scheme `electricwealth://` (see [05](05-routing-and-navigation.md)).
- **Audience:** Retail investors (end users). The demo personas are seeded by `electric-wealth-db`; the demo password is
  `Demo123!` and the MFA code is `123456` (shown on the login screen as hints, `web.demo_hint` / `web.mfa_demo_hint`).
- **Size:** 33 hand-written files under `src/`: 18 pages in 11 feature folders, 3 shared component files, 35 data hooks.

### 1.2 Key Features

| Feature | Routes | Section |
|---|---|---|
| Sign-in with password + MFA, idle sign-out, 7-step online registration | `/login`, `/register` | [13.1](13-feature-modules.md#131-sign-in-mfa-and-registration) |
| Dashboard: portfolio total, day change, alerts, allocation, goals, quick links | `/` | [13.2](13-feature-modules.md#132-dashboard) |
| Accounts list, account detail (performance vs benchmark, holdings, transactions, nickname), open a new account | `/accounts`, `/accounts/:id`, `/accounts/new` | [13.3](13-feature-modules.md#133-accounts) |
| Document vault: filter, download, share by email | `/documents` | [13.4](13-feature-modules.md#134-documents) |
| Savings goals: list and create | `/goals` | [13.5](13-feature-modules.md#135-goals) |
| Market: watchlist, search, news, weekly roundup, security detail with price history, thematic baskets | `/market`, `/market/:symbol`, `/market/baskets` | [13.6](13-feature-modules.md#136-market) |
| Education: lessons by level, mark complete, glossary search | `/learn`, `/learn/glossary` | [13.7](13-feature-modules.md#137-education) |
| Advisor: book / reschedule / cancel meetings, secure messages | `/advisor`, `/advisor/messages` | [13.8](13-feature-modules.md#138-advisor) |
| Notification centre with unread badge | `/notifications` | [13.9](13-feature-modules.md#139-notifications) |
| Profile (read-only personal details, editable address) | `/profile` | [13.10](13-feature-modules.md#1310-profile) |
| Settings: theme, language, notification channels, document delivery, default meeting type | `/settings` | [13.11](13-feature-modules.md#1311-settings) |

Bilingual (Canadian English / Canadian French) throughout, with a language toggle in the top bar.

### 1.3 Technology Stack

From [package.json](../../package.json) (declared ranges) and the build output (resolved versions noted where they were
printed).

| Concern | Choice | Version |
|---|---|---|
| Language | TypeScript, `strict: true` | `~5.9.3` |
| UI library | React + React DOM | `^19.3.0` |
| Routing | `react-router` (declarative `<Routes>`, `BrowserRouter`) | `^7.18.4` |
| Server state | `@tanstack/react-query` | `^5.104.1` |
| HTTP client | `openapi-fetch` (typed from `src/api/schema.d.ts`) | `^0.17.0` |
| API types | `openapi-typescript` (dev) generating `schema.d.ts` from `../electric-wealth-api-spring/openapi.json` | `^7.13.0` (7.13.0 at run) |
| i18n | `i18next` + `react-i18next` | `^26.4.2` / `^17.0.16` |
| Build / dev server | Vite + `@vitejs/plugin-react` | `^8.3.3` (8.3.3 at run) / `^6.1.2` |
| Styling | One hand-written stylesheet, CSS custom properties, no CSS framework | — |
| Charts | Hand-written SVG ([charts.tsx](../../src/components/charts.tsx)) — "no chart library" | — |
| Runtime | Node.js `>=24` (`engines`), `.nvmrc` = `24.19.0` | — |
| Tests | None | — |

### 1.4 Architecture Pattern

**Feature-folder SPA with a thin, generated API layer.** One provider tree ([main.tsx](../../src/main.tsx)):
`QueryClientProvider` → `BrowserRouter` → `AuthProvider` → `App`. `App` switches between two route tables on the
authentication phase ([App.tsx](../../src/App.tsx)). Pages live in `src/features/<area>/` and talk to the API only
through hooks in [hooks.ts](../../src/api/hooks.ts), which call the typed `api` client in
[client.ts](../../src/api/client.ts). Server data is held in the TanStack Query cache; the only client-side global
state is the auth phase (React context) and the locale (i18next). See [04](04-architecture-and-design-patterns.md).

### 1.5 Core Architecture Decisions and Rationale

| Decision | Rationale (as stated in source) | Where |
|---|---|---|
| Generate API types from the Spring API's committed `openapi.json`; fail `verify` if stale | "every URL, parameter and response below is checked by TypeScript" | [client.ts](../../src/api/client.ts), `check:api` script |
| Proxy `/api` through the Vite dev server instead of calling the API cross-origin | "That keeps everything same-origin, so there is no CORS setup in development." | [vite.config.ts](../../vite.config.ts) |
| TanStack Query for all server state, one hook per API call | Same pattern as the mobile app | [hooks.ts](../../src/api/hooks.ts) |
| Include the locale in query keys for localised endpoints | The API localises responses by `Accept-Language` | `queryKeys.dashboard/education/glossary` |
| Tokens in `sessionStorage` | "a page refresh keeps you signed in, but closing the tab signs you out" | [tokenStore.ts](../../src/auth/tokenStore.ts) |
| 15-minute idle sign-out; refresh the access token every 10 minutes | Access tokens last 15 minutes | [AuthContext.tsx](../../src/auth/AuthContext.tsx) |
| No chart library | "nothing extra to install" | [charts.tsx](../../src/components/charts.tsx) |
| Map mobile deep links to web routes, label the rest "Mobile app only" | Some features exist only in the mobile app | [deepLinks.ts](../../src/lib/deepLinks.ts) |

### 1.6 Dependencies and External Services

| Dependency | Kind | How it is used |
|---|---|---|
| `electric-wealth-api-spring` | Runtime HTTP backend | All data. Default `http://localhost:4200`, reached via the dev proxy `/api` → `API_URL`. 47 of its 49 operations are called ([08](08-api-integration.md)). |
| `electric-wealth-api-spring/openapi.json` | Build-time file (sibling checkout) | Source of `src/api/schema.d.ts` (`gen:api`, `check:api`). The repos must be cloned side by side. |
| `electric-wealth-db` | Indirect | Seeds the personas the web app signs in as; the web app never touches it. |
| Third-party services | — | None: no analytics, error reporting, fonts, CDNs or maps. Fonts are the system stack. |

