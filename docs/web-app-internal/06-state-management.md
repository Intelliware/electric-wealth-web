---
title: "State Management"
block: reverse-eng/web-app/internal/state-management
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 6. State Management

### 6.1 State Architecture

| Kind | Mechanism | Lifetime | Source |
|---|---|---|---|
| Server state | TanStack Query cache (one `QueryClient`) | In memory; cleared on logout (`queryClient.clear()`) | [main.tsx](../../src/main.tsx), [hooks.ts](../../src/api/hooks.ts) |
| Session | `AuthContext` (`phase`, `signOutReason`) + `tokenStore` | Phase in React state; tokens in `sessionStorage['ew_tokens']` + module variable | [AuthContext.tsx](../../src/auth/AuthContext.tsx), [tokenStore.ts](../../src/auth/tokenStore.ts) |
| Locale | i18next instance | `localStorage['ew_locale']`, else browser language | [i18n/index.ts](../../src/i18n/index.ts) |
| Theme | Derived from cached preferences → `document.documentElement.dataset.theme` | Follows the `['preferences']` query | `useThemePreference` in [Layout.tsx](../../src/components/Layout.tsx) |
| UI state | `useState` in pages (filters, page numbers, wizard step, edit mode, dialog open) | Component lifetime; not in the URL | `features/**` |

There is no Redux, Zustand, MobX or other global store.

**QueryClient defaults** (`main.tsx`):

```ts
queries: {
  staleTime: 30_000,
  // Don't retry client errors (401/404/400); retry network and server errors once.
  retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 1,
  refetchOnWindowFocus: false,
}
```

Mutations use the library default (no retry).

### 6.2 State Slices / Modules

**Query keys** (`queryKeys` in [hooks.ts](../../src/api/hooks.ts), plus four inline keys):

| Key | Hook | Overrides | Updated by |
|---|---|---|---|
| `['dashboard', locale]` | `useDashboard` | — | invalidated by `useUpdateAccount`, `useOpenAccount` |
| `['profile']` | `useProfile` | `staleTime` 5 min | `useUpdateAddress` → `setQueryData` |
| `['preferences']` | `usePreferences` | `staleTime` 5 min | `useUpdatePreferences` (optimistic, rollback, then `setQueryData`) |
| `['accounts', page]` | `useAccounts(page = 1)` | `pageSize: 20` | invalidated (`['accounts']`) by account update/open |
| `['account', id]` | `useAccount` | — | `useUpdateAccount` → `setQueryData` |
| `['transactions', id, page, type ?? 'all']` | `useTransactions` | `pageSize: 10`, `keepPreviousData` | — |
| `['performance', id, range]` | `usePerformance` | — | — |
| `['documents', { year, category }]` | `useDocuments` | `pageSize: 100`, `keepPreviousData` | — |
| `['notifications']` | `useNotifications` | `refetchInterval` 60 s | `useMarkNotificationRead` / `useMarkAllNotificationsRead` → `setQueryData` |
| `['goals']` | `useGoals` | `pageSize: 100` | invalidated by `useCreateGoal` |
| `['education', locale, level ?? 'all']` | `useEducationContent` | `keepPreviousData` | invalidated (`['education']`) by `useSaveEducationProgress` |
| `['glossary', locale, q]` | `useGlossary` | `keepPreviousData` | — |
| `['advisor', 'availability']` | `useAdvisorAvailability` | — | invalidated (`['advisor']`) on settle of book / update |
| `['advisor', 'appointments']` | `useAppointments` | — | same |
| `['advisor', 'messages']` | `useAdvisorMessages` | — | `useSendAdvisorMessage` appends via `setQueryData` (also matched by `['advisor']` invalidation) |
| `['market', 'watchlist']` | `useWatchlist` | — | `useToggleWatchlist` → `setQueryData`; also invalidates `['market','security',symbol]` |
| `['market', 'security', symbol]` | `useSecurity` | — | invalidated by `useToggleWatchlist` |
| `['market', 'history', symbol, range]` | `usePriceHistory` | `keepPreviousData` | — |
| `['market', 'search', q]` | `useMarketSearch` | `enabled: q.length >= 2` | — |
| `['market', 'news']` (inline) | `useMarketNews` | — | — |
| `['market', 'roundup']` (inline) | `useMarketRoundup` | — | — |
| `['market', 'baskets']` (inline) | `useBaskets` | — | — |
| `['registration', 'questions', locale]` (inline, in `RegisterPage`) | `useQuery` | `enabled: step === 3` | — |

Mutations with no cache effect: `useShareDocument`. The registration steps, login, MFA, refresh and logout call `api`
directly and do not touch the cache (except logout's `clear()`).

**Locale in keys:** dashboard, education, glossary and registration questions include the locale. These are exactly the
four operations that read `Accept-Language` in the API (`DashboardController`, `EducationController` content and
glossary, `RegistrationController` security questions), so a language switch refetches all localised data and nothing
else.

**AuthContext value:**

```ts
interface AuthContextValue {
  phase: 'unauthenticated' | 'mfa' | 'authenticated';
  signOutReason: 'user' | 'idle' | 'expired' | null;
  login(email, password): Promise<void>;
  verifyMfa(code): Promise<void>;
  startSession(tokens: { accessToken; refreshToken }): void;
  logout(reason?: SignOutReason): void;
}
```

### 6.3 Accessing State in Components

```tsx
// Server state: call the hook, branch on its status
const { data, isLoading, error, refetch } = useAccounts();
if (isLoading) return <Loading />;
if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

// Mutations: mutate with per-call callbacks for UI state
const update = useUpdateAccount(id);
update.mutate({ nickname: value.trim() || null }, { onSuccess: () => setEditing(false) });

// Session
const { phase, login, logout } = useAuth();   // throws outside <AuthProvider>

// Locale
const { t, i18n } = useTranslation();         // re-renders on language change
const locale = getAppLocale();                 // plain read for Intl formatters
```

Pages read the locale with `getAppLocale()` at render time; they re-render on a language change because they also call
`useTranslation()`.

