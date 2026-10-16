---
title: "Routing and Navigation"
block: reverse-eng/web-app/internal/routing-and-navigation
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 5. Routing and Navigation

### 5.1 Route Configuration

Declarative `react-router` v7 `<Routes>` in [App.tsx](../../src/App.tsx), rendered inside `BrowserRouter`
([main.tsx](../../src/main.tsx)). There is no route config object, no data routers/loaders and no lazy routes.
`App` returns **one of two route tables** depending on `useAuth().phase`.

**Signed-out table** (`phase` is `unauthenticated` or `mfa`):

| Path | Element | Notes |
|---|---|---|
| `/login` | `MfaPage` if `phase === 'mfa'`, else `LoginPage` | Same URL for both steps |
| `/register` | `RegisterPage` | 7-step enrolment wizard |
| `*` | `<Navigate to="/login" replace>` with router state `{ returnTo }` | `returnTo` = current `pathname + search`, or `/` when on `/login` / `/register` |

**Signed-in table** (`phase === 'authenticated'`). All app pages are children of a pathless layout route
`<Route element={<Layout/>}>`, rendered through `<Outlet/>` in `<main id="main">`.

| Path | Element | Params / query |
|---|---|---|
| `/login` | `<Navigate to={returnTo} replace/>` | `returnTo` from `location.state`, default `/` |
| `/` (index) | `DashboardPage` | — |
| `/accounts` | `AccountsPage` | — |
| `/accounts/new` | `AccountOpenPage` | — (declared before `:id`; v7 ranks static segments first anyway) |
| `/accounts/:id` | `AccountDetailPage` | `id` |
| `/advisor` | `AdvisorPage` | — |
| `/advisor/messages` | `AdvisorMessagesPage` | — |
| `/documents` | `DocumentsPage` | `?highlight=<documentId>` |
| `/goals` | `GoalsPage` | — |
| `/learn` | `LearnPage` | — |
| `/learn/glossary` | `GlossaryPage` | — |
| `/market` | `MarketPage` | — |
| `/market/baskets` | `BasketsPage` | — |
| `/market/:symbol` | `SecurityPage` | `symbol` (URL-encoded; decoded with `decodeURIComponent`) |
| `/notifications` | `NotificationsPage` | — |
| `/profile` | `ProfilePage` | — |
| `/settings` | `SettingsPage` | — |
| `*` | `NotFound` (inside `Layout`) | "Back to dashboard" link |

`/register` is **not** in the signed-in table, so a signed-in user who opens it gets `NotFound`.

**Navigation UI** ([Layout.tsx](../../src/components/Layout.tsx)): top-bar `NavLink`s to `/` (with `end`), `/accounts`,
`/documents`, `/goals`, `/market`, `/learn`, `/advisor`; bell → `/notifications`; user menu → `/profile`,
`/settings`, sign out. Sub-pages use a breadcrumb `← <Parent>` link (`AccountDetailPage`, `SecurityPage`,
`BasketsPage`, `GlossaryPage`, `AdvisorMessagesPage`). `NavLink` adds the `active` class used by `.topnav a.active`.

Programmatic navigation: `useNavigate()` in `AccountOpenPage` (cancel → `/accounts`) and `RegisterPage` (finish →
`/`, `replace`).

### 5.2 Navigation Guards and Protection

There are no per-route guards. Protection is structural: while `phase !== 'authenticated'` the signed-in routes do
not exist, so every URL other than `/login` and `/register` redirects to `/login`.

**Return-to-origin:** the redirect stores `returnTo` in router state. After sign-in, `phase` becomes `authenticated`,
`App` renders the signed-in table at `/login`, and that route navigates to `location.state.returnTo`. Example: opening
`/documents?highlight=d1` signed out → `/login` → (password, MFA) → `/documents?highlight=d1`. Registration ignores
`returnTo` and always lands on `/`.

**Auth phase transitions** that switch tables: `login()` → `mfa` (or `authenticated` if the API says
`mfaRequired: false`); `verifyMfa()` / `startSession()` → `authenticated`; `logout(reason)` → `unauthenticated`. The
signed-out table is shown again on the current URL, so the catch-all immediately redirects to `/login` with that URL
as `returnTo`. See [09](09-authentication-and-authorization.md).

The guard is UX only; the API enforces auth on every protected call (`bearerAuth`).

### 5.3 Route Parameters and Query Strings

| Route | Read with | Used for |
|---|---|---|
| `/accounts/:id` | `const { id = '' } = useParams()` | `useAccount(id)`, `usePerformance`, `useTransactions`, `useUpdateAccount` |
| `/market/:symbol` | `decodeURIComponent(useParams().symbol ?? '')` | `useSecurity`, `usePriceHistory`, `useToggleWatchlist` |
| `/documents?highlight=` | `useSearchParams().get('highlight')` | Adds `is-highlighted` to the matching table row |

Links that build these URLs encode the segment: `` `/accounts/${encodeURIComponent(account.id)}` ``,
`securityPath(symbol)` in [MarketPage.tsx](../../src/features/market/MarketPage.tsx). Filters, tabs, pages and search
terms are **component state, not URL state**: refreshing `/documents` resets filters, `/accounts/:id` resets the
transaction filter/page, and the back button does not undo filter changes.

**Deep links from the API.** Dashboard alerts and quick links carry mobile deep links (`electricwealth://…`).
[`deepLinkToRoute()`](../../src/lib/deepLinks.ts) maps them:

| Deep link | Web route |
|---|---|
| `electricwealth://documents` / `…/documents/<id>` | `/documents` / `/documents?highlight=<id>` |
| `electricwealth://accounts` / `…/accounts/new` / `…/accounts/<id>` | `/accounts` / `/accounts/new` / `/accounts/<id>` |
| `electricwealth://advisor` / `…/advisor/messages` | `/advisor` / `/advisor/messages` (any other id → `/advisor`) |
| `electricwealth://market` / `…/market/baskets` / `…/market/<symbol>` | `/market` / `/market/baskets` / `/market/<symbol>` |
| `electricwealth://learn` / `…/learn/glossary` | `/learn` / `/learn/glossary` (any other id → `/learn`) |
| `electricwealth://notifications`, `…/profile`, `…/settings` | `/notifications`, `/profile`, `/settings` |
| anything else, or not starting with the scheme | `undefined` → rendered without a link, tagged "Mobile app only" (`web.not_on_web`) |

