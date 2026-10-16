---
title: "Testing Strategy"
block: reverse-eng/web-app/internal/testing-strategy
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 18. Testing Strategy

### 18.1 Testing Approach

**There are no automated tests in this repo**: no test runner (Vitest, Jest, Playwright, Cypress), no test files, no
`test` script, no CI workflow. The quality gate is static:

| Gate | Command | What it catches |
|---|---|---|
| Contract freshness | `npm run check:api` | `src/api/schema.d.ts` out of date with `../electric-wealth-api-spring/openapi.json` |
| Type safety | `npm run typecheck` (`tsc -b`, `strict`) | Calling a removed endpoint, wrong params/body, using a renamed response field, unused code |
| Both | `npm run verify` | README: the "ready to push" check |

Both passed on 2026-10-16 at `bbb4907` (`check:api` against API `openapi.json` at `8a61cde`). Because the client is
typed from the OpenAPI document, most API contract drift fails the type-check. Runtime behaviour (rendering, auth
timers, cache invalidation, i18n) is untested.

The Spring API has its own test suite (see the API Part A, section 22); it does not exercise this web app.

### 18.2 Running Tests

```bash
# Run all tests (watch mode, if configured)
#   not available — no test runner is installed

# Static checks (the only automated gate)
npm run verify          # check:api + typecheck
npm run check:api       # contract only
npm run typecheck       # TypeScript only

# Run E2E suite
#   not available

# Manual smoke test
npm run dev             # then sign in as sarah.chen@example.com / Demo123! / 123456
```

### 18.3 Testing Examples

No examples exist in the codebase. If tests are introduced, the natural seams are:

| Unit | Seam |
|---|---|
| `lib/format.ts`, `lib/deepLinks.ts` | Pure functions — plain unit tests |
| `api/client.ts` `unwrap` / middleware | Fake `Response` objects |
| Hooks in `api/hooks.ts` | `QueryClientProvider` wrapper + mocked `fetch` (or MSW using the OpenAPI document) |
| `AuthProvider` timers | Fake timers for the 10-min refresh and 15-min idle timeout |
| Pages | React Testing Library with providers from `main.tsx` |
| Locale parity | Compare key sets of `en-CA.json` and `fr-CA.json` (currently equal, 440 each) |

