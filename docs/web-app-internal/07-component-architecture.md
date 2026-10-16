---
title: "Component Architecture"
block: reverse-eng/web-app/internal/component-architecture
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 7. Component Architecture

### 7.1 Component Hierarchy

```text
<StrictMode>
└─ QueryClientProvider → BrowserRouter → AuthProvider
   └─ App                                   (chooses route table by auth phase)
      ├─ signed out
      │  ├─ LoginPage | MfaPage             (both wrapped in AuthCard)
      │  └─ RegisterPage                    (AuthCard + StepForm + CredentialsStep / IdentityStep /
      │                                      SecurityQuestionsStep / TrustedContactStep / ConsentStep)
      └─ signed in
         └─ Layout
            ├─ skip link, header.topbar
            │  ├─ brand NavLink, nav.topnav (7 NavLinks)
            │  └─ NotificationBell, language toggle button, UserMenu (<details>)
            └─ main#main → <Outlet/> → one of the 17 pages (+ NotFound)
                 each page = PageHeader + Card(s) + shared ui/charts + page-local sub-components
```

**Shared components** — [ui.tsx](../../src/components/ui.tsx) ("web counterparts of mobile/src/components"), all
stateless:

| Component | Props | Renders |
|---|---|---|
| `Card` | `children`, `className?`, `tone?: 'warning'` | `<section class="card card--{tone}">` |
| `Eyebrow` | `children` | `<p class="eyebrow">// UPPERCASED TEXT</p>` |
| `PageHeader` | `title`, `eyebrow?`, `actions?` | `<header>` with `Eyebrow`, `<h1>`, actions slot |
| `SectionTitle` | `children`, `action?` | `<h2>` + optional action |
| `Loading` | — | `role="status" aria-live="polite"` spinner + `common.loading` |
| `ErrorState` | `error: unknown`, `onRetry?` | `role="alert"`, `common.error_generic`, "Trace: {traceId}" when `ApiError`, Retry button |
| `EmptyState` | `title`, `body?` | Title + muted body |
| `Tag` | `children`, `tone?: 'neutral' \| 'info' \| 'warning' \| 'success'` | `<span class="tag tag--{tone}">` |
| `ChangeIndicator` | `changePct`, `currency`, `changeMinor?`, `label?` | ▲/▼/— glyph (`aria-hidden`), `$x.xx · +y.yy %`, class `change--up/down/flat` |
| `ProgressBar` | `value` (clamped 0–100), `label` | `role="progressbar"` with `aria-valuenow/min/max`; `progress--good` at ≥ 50 else `progress--low` |
| `Segmented` (generic `<T extends string>`) | `options: {id, label}[]`, `value`, `onChange`, `label` | `role="group"` of buttons with `aria-pressed` |
| `Pagination` | `page`, `pageSize`, `total`, `onChange` | Prev / "Page x of y" / Next; renders nothing when ≤ 1 page |

**Charts** — [charts.tsx](../../src/components/charts.tsx), plain SVG, `viewBox` 1000 × 260, scaled by CSS:

| Component | Input | Notes |
|---|---|---|
| `AllocationBar` | `segments: {assetClass, pct}[]`, `totalMinor`, `currency` | Stacked bar (`aria-hidden`) + legend list with % and money; colours cycle `--chart-1..4` |
| `PerformanceChart` | `series`, `benchmark: {t, v}[]`, `label` | Both series rebased so the first point = 100; baseline at 100; `role="img" aria-label`; returns `null` for an empty series |
| `PriceChart` | `series: {t, c}[]`, `label`, `up` | Line + shaded area, raw values; `price-chart--up/down`; `null` if < 2 points |

**Layout internals** ([Layout.tsx](../../src/components/Layout.tsx)): `useThemePreference()` (applies the saved theme),
`NotificationBell` (unread count from `useNotifications`, badge `9+` cap, `aria-label` with the count),
`UserMenu` (`<details>` closed on route change and on outside click; shows initials, profile, settings, sign out).

### 7.2 Component Documentation Template

How pages are built, using `GoalsPage` as the reference
([GoalsPage.tsx](../../src/features/goals/GoalsPage.tsx)):

```tsx
export function GoalsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data, isLoading, error, refetch } = useGoals();        // 1. data hook
  const [adding, setAdding] = useState(false);                   // 2. local UI state

  return (
    <>
      <PageHeader title={t('goals.title')} actions={…} />        // 3. header with actions
      {adding ? <GoalForm onDone={() => setAdding(false)} /> : null}
      {isLoading ? <Loading />                                   // 4. the four states
        : error ? <ErrorState error={error} onRetry={() => void refetch()} />
        : !data?.items.length ? <Card><EmptyState … /></Card>
        : <ul className="goal-grid">…</ul>}
    </>
  );
}
```

Template for documenting a component in this codebase:

| Field | Example (`NicknameEditor` in `AccountDetailPage.tsx`) |
|---|---|
| Purpose | Inline rename of an account |
| Props | `id: string`, `nickname: string \| null` |
| Local state | `editing`, `value` |
| Hooks | `useUpdateAccount(id)` |
| API | `PATCH /api/wealth/accounts/{id}` `{ nickname: string \| null }` (empty → `null` clears it) |
| States | idle button → form (input `maxLength` 40, Save, Cancel) → error text on failure; closes on success |
| A11y | Visually hidden `<label>`, `autoFocus` on open |
| i18n keys | `accounts.edit_nickname`, `accounts.nickname`, `common.save`, `common.cancel`, `common.error_generic` |


---

# Part 3 — Integration
