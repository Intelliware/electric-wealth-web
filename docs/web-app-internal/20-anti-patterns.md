---
title: "Anti-Patterns"
block: reverse-eng/web-app/internal/anti-patterns
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 20. Anti-Patterns

### 20.1 Common Mistakes to Avoid

Rules for contributors, followed by the places where the current code already deviates from good practice.

**Do not:**

| Anti-pattern | Instead |
|---|---|
| Hand-edit `src/api/schema.d.ts` | Change the API, regenerate `openapi.json` there, then `npm run gen:api` |
| Call `fetch` directly or build URLs by string | Use the typed `api` client (paths and params are type-checked) |
| Call `api` from a page | Add a hook to `hooks.ts` with a key in `queryKeys` |
| Forget the locale in the query key of a localised endpoint | Include `i18n.language` for any endpoint that reads `Accept-Language` |
| Show `ApiError.message` to users | Map `code`/`status` to a translation key |
| Add a string to one locale file only | Add to both `en-CA.json` and `fr-CA.json` |
| Put money in floats | Keep cents as integers; format with `formatMoney` |
| Hard-code colours | Use tokens (`var(--…)`) and define dark values |
| Read tokens from `sessionStorage` directly | Use `tokenStore` |
| Keep server data in `useState` | Use the query cache |

**Known issues in the current code** (found during extraction, `bbb4907`):

| # | Issue | Where | Impact |
|---|---|---|---|
| 1 | Saved `language` preference is never applied on sign-in; Settings shows the saved value, which can differ from the UI language | `i18n/index.ts`, `SettingsPage.tsx` | Confusing language state across devices / browsers |
| 2 | Accounts list fetches page 1 only (`pageSize: 20`) and sums those balances | `useAccounts`, `AccountsPage.tsx` | Clients with > 20 accounts see a partial list and total |
| 3 | Documents and goals fetch `pageSize: 100` with no paging; document search is client-side | `hooks.ts`, `DocumentsPage.tsx` | Silent truncation above 100 |
| 4 | No React error boundary | `main.tsx` / `App.tsx` | A render exception blanks the app |
| 5 | Download failure is unhandled (no `catch`) | `DocumentsPage.download` | No feedback; unhandled rejection |
| 6 | Market search ignores errors (shows "no results") | `SecuritySearch` | Misleading message |
| 7 | Meeting cancel uses `window.confirm` and never shows its error | `MeetingRow` | Inconsistent UX, silent failure |
| 8 | Hard-coded English: "Skip to content", "Trace:", pagination `aria-label` | `Layout.tsx`, `ui.tsx` | Untranslated in French |
| 9 | Unused locale sections `tabs`, `more`, `change` (ported from mobile) | locale JSON | Dead strings |
| 10 | Document year filter hard-coded to 2024 / 2023 | `DocumentsPage.tsx` | Breaks as years pass |
| 11 | Theme `data-theme` not reset on sign-out | `useThemePreference` | Login screen keeps the last user's theme until reload |
| 12 | Dark tokens duplicated in two CSS blocks; `--chart-*` and hero change colours not themed | `styles.css` | Drift risk; possible contrast issues |
| 13 | Demo values in the UI (pre-filled email, demo password/MFA/identities hints) | `AuthPages.tsx`, `RegisterPage.tsx`, locale `web.*demo*` | Must be removed for production |
| 14 | MFA call sends fixed `challengeId: 'web'`, `method: 'sms'` regardless of the user's chosen method | `AuthContext.verifyMfa` | Works only because the API ignores both |
| 15 | No tests | repo | Behaviour changes are unguarded |


---

# Part 8 — Reference
