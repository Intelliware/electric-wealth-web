---
title: "Internationalization (i18n)"
block: reverse-eng/web-app/internal/internationalization-i18n
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 14. Internationalization (i18n)

### 14.1 i18n Setup

[i18n/index.ts](../../src/i18n/index.ts), imported for its side effect by `main.tsx` before the first render:

```ts
void i18n.use(initReactI18next).init({
  resources: { 'en-CA': { translation: enCA }, 'fr-CA': { translation: frCA } },
  lng: initialLocale(),
  fallbackLng: 'en-CA',
  interpolation: { escapeValue: false },
});
document.documentElement.lang = i18n.language;
```

| Concern | Behaviour |
|---|---|
| Locales | `en-CA`, `fr-CA` (type `AppLocale`); bundled JSON, no lazy loading |
| Initial locale | `localStorage['ew_locale']` if valid, else `fr-CA` when `navigator.language` starts with `fr`, else `en-CA` |
| Switching | `setAppLocale(locale)`: `i18n.changeLanguage`, sets `<html lang>`, saves `ew_locale` |
| Where switched | Top-bar toggle and Settings (both also save `language` to the user's preferences); `AuthCard` toggle (local only) |
| Saved preference on sign-in | **Not applied.** The `language` preference from `GET /api/preferences` is never read back into i18next; the local `ew_locale` wins |
| API language | Every request sends `Accept-Language: getAppLocale()`; localised queries are keyed by locale (see [06.2](06-state-management.md#62-state-slices--modules)) |
| Formatting | `Intl` with the app locale in [format.ts](../../src/lib/format.ts): `formatMoney` (currency, 2 decimals, from cents), `formatPercent` (`signDisplay: 'exceptZero'`), `formatDate` (`medium`, UTC), `formatDateTime` (`medium` + `short`, local time), `formatBytes`, `formatSlotTime` (24 h slot → locale time, e.g. "2:30 p.m." / "14 h 30"), `formatDayParts` |
| Escaping | `escapeValue: false` (React escapes) |

### 14.2 Using Translations in Components (illustrative — react-i18next)

```tsx
const { t } = useTranslation();
t('accounts.title');                                   // plain key
t('dashboard.greeting_named', { name: firstName });     // fills the "name" placeholder in "Good morning, …"
t('web.unread_count', { count: unread });               // plural: web.unread_count_one / _other
t(`goals.category_${goal.category.toLowerCase()}`);     // key built from an API enum
t(`web.register_errors.${code}`, { defaultValue: t('common.error_generic') }); // fallback for unknown codes
```

Money, dates and percentages are never put in translation strings; they are formatted with `format.ts` and
interpolated.

### 14.3 Translation Keys

[en-CA.json](../../src/i18n/en-CA.json) and [fr-CA.json](../../src/i18n/fr-CA.json): **440 leaf keys each, identical
key sets** (checked 2026-10-16). All 289 distinct static keys used in `src/` (373 static `t('…')` calls) exist in
`en-CA`. Plurals use i18next
`_one` / `_other` suffixes (`web.unread_count`, `web.notifications_unread`).

| Section | Keys | Origin |
|---|---|---|
| `common` | 26 | mobile |
| `auth` | 23 | mobile |
| `register` | 31 | mobile |
| `onboarding` | 9 | mobile |
| `dashboard` | 18 | mobile |
| `accounts` / `account_detail` / `account_open` | 16 / 14 / 10 | mobile |
| `documents` | 17 | mobile |
| `market` / `stock_detail` / `baskets` | 10 / 8 / 7 | mobile |
| `education` / `glossary` | 12 / 4 | mobile |
| `advisor` | 23 | mobile |
| `goals` | 16 | mobile |
| `notifications` | 10 | mobile |
| `profile` | 32 | mobile |
| `settings` | 24 | mobile |
| `tabs` / `more` / `change` | 5 / 10 / 5 | mobile; not used by the web app |
| `web` | 110 | web-only strings (navigation, tables, wizard labels, register error codes, account type names) |

Dynamic keys (built at runtime; must exist for every enum value the API can return): `web.account_types.<TYPE>.name|description`,
`web.meeting_status_<status>`, `register.step<n>_title|subtitle`, `web.register_errors.<CODE>`, `register.mfa_<m>`,
`web.mfa_<m>_description`, `onboarding.slide<n>_title|body`, `register.consent_*`, `education.level_<level>`,
`education.type_<type>`, `goals.category_<category>`, `baskets.risk_<risk>`, `profile.provinces.<CODE>`,
`settings.notify_<channel>`.

**Not translated** (hard-coded English): the skip link "Skip to content" ([Layout.tsx](../../src/components/Layout.tsx)),
"Trace:" in `ErrorState` and the `Pagination` `aria-label` ([ui.tsx](../../src/components/ui.tsx)). Text returned by
the API (account types, tax status, transaction types, notification titles, news) is shown as returned.

