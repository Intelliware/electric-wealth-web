---
title: "Performance Patterns"
block: reverse-eng/web-app/internal/performance-patterns
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 16. Performance Patterns

### 16.1 Code Splitting

None. There are no `React.lazy`, dynamic `import()` or route-level chunks, and no `build.rollupOptions` in
[vite.config.ts](../../vite.config.ts). Both locale files are bundled. Production build on 2026-10-16 (Vite 8.3.3,
124 modules):

| Asset | Size | Gzip |
|---|---|---|
| `index.html` | 0.52 kB | 0.32 kB |
| `assets/index-*.css` | 22.59 kB | 5.12 kB |
| `assets/index-*.js` | 466.15 kB | 140.42 kB |

No performance budget is defined.

**Network-side patterns** that matter more than bundle size here:

| Pattern | Where |
|---|---|
| `staleTime` 30 s globally, 5 min for profile and preferences | `main.tsx`, `hooks.ts` |
| No refetch on window focus | `main.tsx` |
| `keepPreviousData` to avoid flashes when paging/filtering | transactions, documents, education, glossary, price history |
| `useDeferredValue` + `enabled: q.length >= 2` for type-ahead | market search, glossary |
| Cache writes from mutation responses instead of refetching | profile, preferences, account, notifications, messages, watchlist |
| Conditional query | registration security questions only on step 3 |
| Polling | notifications every 60 s whenever signed in (the bell is always mounted) |
| Token refresh | one `POST /api/auth/refresh` every 10 min while signed in |

Large-page shortcuts: documents and goals request `pageSize: 100` and do not page; document name search is
client-side.

### 16.2 Memoization

Minimal and deliberate. `useMemo` / `useCallback` appear only in [AuthContext.tsx](../../src/auth/AuthContext.tsx) to
keep the context value and its functions stable (so consumers don't re-render on every provider render and the
effects' dependency arrays stay stable). No `React.memo` components. The React Compiler is not enabled. Charts
recompute their paths on each render; with ≤ a few hundred points this is cheap. React `StrictMode` is on, so effects
run twice in development.

