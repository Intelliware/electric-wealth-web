---
title: "Quick Reference"
block: reverse-eng/web-app/internal/quick-reference
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 23. Quick Reference

### 23.1 Command Cheat Sheet

```bash
# Development
npm install
npm run dev                  # http://localhost:5173, /api → API_URL (default http://localhost:4200)

# Production
npm run build                # tsc -b && vite build → dist/
npm run preview              # serve dist/ (with the same /api proxy)

# Testing
npm run verify               # check:api + typecheck (no test runner exists)

# Other
npm run gen:api              # regenerate src/api/schema.d.ts from ../electric-wealth-api-spring/openapi.json
npm run check:api            # fail if schema.d.ts is stale
npm run typecheck            # tsc -b
```

**Demo sign-in:** any seeded persona email (e.g. `sarah.chen@example.com`), password `Demo123!`, MFA `123456`.

**Hard-coded constants:**

| Constant | Value | File |
|---|---|---|
| Idle timeout | 15 min | `AuthContext.tsx` `IDLE_TIMEOUT_MS` |
| Token refresh interval | 10 min | `AuthContext.tsx` `REFRESH_EVERY_MS` |
| Default `staleTime` | 30 s (profile, preferences: 5 min) | `main.tsx`, `hooks.ts` |
| Notifications poll | 60 s | `hooks.ts` |
| Page sizes | accounts 20, transactions 10, documents 100, goals 100 | `hooks.ts` |
| Search minimum | 2 characters (market) | `hooks.ts`, `MarketPage.tsx` |
| Storage keys | `ew_tokens` (session), `ew_locale` (local) | `tokenStore.ts`, `i18n/index.ts` |
| Dev server port | 5173 | `vite.config.ts` |

### 23.2 Component Development Checklist

- [ ] Shared and stateless → `src/components/ui.tsx` (or `charts.tsx`); page-specific → unexported function in the page file
- [ ] Named export, typed props inline
- [ ] All text through `t()`; keys added to **both** locale files
- [ ] Money/dates/percent through `lib/format.ts` with `getAppLocale()`
- [ ] Styles in `styles.css` using tokens; BEM-like class names; dark mode checked
- [ ] Labels for inputs, `aria-label` for icon-only buttons, `aria-pressed` for toggles, `role="status"`/`"alert"` for messages
- [ ] Works at < 640 px width
- [ ] `npm run verify` passes

### 23.3 Feature Development Checklist

- [ ] API operation exists in `../electric-wealth-api-spring/openapi.json`; run `npm run gen:api` if it changed
- [ ] Hook added to `src/api/hooks.ts`; key added to `queryKeys` (include locale if the endpoint reads `Accept-Language`)
- [ ] Mutations update or invalidate every affected key (see [06.2](06-state-management.md#62-state-slices--modules))
- [ ] Page in `src/features/<area>/<Name>Page.tsx` with loading / error / empty / data states
- [ ] Route added to the signed-in table in `src/App.tsx`; nav link in `Layout.tsx` if top-level
- [ ] If the API returns a deep link for it, map it in `src/lib/deepLinks.ts`
- [ ] Error codes mapped to translated messages (no raw `ApiError.message`)
- [ ] `en-CA.json` and `fr-CA.json` updated together
- [ ] `npm run verify` passes; manual smoke test in both languages and both themes
- [ ] Docs: update this Part A (05, 06, 08, 13) and `extraction-status.md`; log in `CHANGE-TRACKER.md`

