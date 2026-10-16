---
title: "Verification Report — electric-wealth-web"
skill: reverse-engineer-web-app
step: verify
source_repo: electric-wealth-web
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
verified: 2026-10-16
---

## Verification Report — Electric Wealth Web App

**Date:** 2026-10-16
**Mode:** automated (chosen by the user at the RE close-out gate; `project.toml` `re_verification_gate = "ask"`)
**Scope:** Full — Part A `docs/web-app-internal/01…24`, Part B `<KB>/source-docs/electric-wealth-web/web-app-consumer/01…11`, `extraction-status.md`, `CHANGE-TRACKER.md`
**Source commit:** `bbb4907dd0d866223742c529ea65a75ec8af576f` (branch `kb1`)

### Verdict

**MECHANICAL: GO**

Scope of this verdict: Tier M checks only. It attests that the extraction is well-formed — inventory reconciled, no
unresolved markers, cross-references resolve, declared source constructs match. It does NOT attest that the
documentation is correct. See UNVERIFIED below for what nobody has checked.

### Tier M — checked (20 passed / 0 failed)

Checks 1–18 were run by a Node script over the docs and source (`node ew-verify.mjs`, kept outside the repo); evidence
is its output. Checks 19–20 are the repo's own tooling.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Part A file set = composition | PASS | `re-web-app-internal.yaml` → 24 expected (`has_forms`, `has_i18n` true); found 24; missing = [], extra = [] |
| 2 | Part B file set = composition minus optional block 12 | PASS | `re-web-app-consumer.yaml` → 11 expected after omitting `12-support-and-contact`; found 11; missing = [], extra = [] |
| 3 | Every template H2/H3 heading present in its file | PASS | Headings parsed from each `templates/blocks/reverse-eng/web-app/<part>/<slug>.md` (outside code fences); missing = [] (feature-modules uses real feature headings by design) |
| 4 | No placeholder / TODO / template markers | PASS | Pattern `/TODO\|TBD\|FIXME\|\{\{…\}\}\|\[e\.g\.,\|\[placeholder/` over all 37 doc files; hits = [] (2 hits fixed during verification, see Failures) |
| 5 | No UNVERIFIED markers in A/B docs | PASS | Scope: the 35 rendered A/B files; files with a hit = [] (the side files `extraction-status.md` and `CHANGE-TRACKER.md` mention "UNVERIFIED" only as this gate's result count, which is not an unresolved marker) |
| 6 | Frontmatter complete, `source_commit` = documented commit | PASS | 35 rendered files have `title, block, part, source_repo, source_version, source_commit, extracted`; bad = [] |
| 7 | Freshness | PASS | `git rev-parse HEAD` = `bbb4907dd0d8…`; `git status --porcelain -- . ':!docs'` = empty |
| 8 | Every `<Route>` in `App.tsx` documented in A 05 | PASS | 22 `<Route>` elements in source (incl. pathless layout route); missing = [] |
| 9 | API operations: source = A 08.2 table ⊆ `openapi.json` | PASS | Source `api.<METHOD>('<path>'` calls = 47; A 08.2 rows = 47; spec = 49; only-in-source = [], only-in-doc = [], not-in-spec = []; unused spec ops = `GET /health`, `GET /api/market/quote` (as documented) |
| 10 | Every exported hook in `hooks.ts` documented in A 06/08 | PASS | 35 `export function use…`; missing = [] |
| 11 | Every feature page component documented in A 13 | PASS | 18 files → 20 components (`AuthPages` exports 3); missing = [] |
| 12 | Every shared component documented in A 07 | PASS | 12 in `ui.tsx` + 3 in `charts.tsx`; missing = [] (1 fixed during verification) |
| 13 | Cited constants: source line ↔ A 23 value | PASS | `IDLE_TIMEOUT_MS = 15 * 60_000` ↔ 15 min; `REFRESH_EVERY_MS = 10 * 60_000` ↔ 10 min; `staleTime: 30_000` ↔ 30 s; `refetchInterval: 60_000` ↔ 60 s; `pageSize: 20` ↔ accounts 20; `pageSize: 10` ↔ transactions 10; `port: 5173` ↔ 5173; `env.API_URL \|\| 'http://localhost:4200'` ↔ `http://localhost:4200`; `KEY = 'ew_tokens'` ↔ `ew_tokens`; `LOCALE_KEY = 'ew_locale'` ↔ `ew_locale` |
| 14 | Locale parity claim (A 14.3) | PASS | `en-CA.json` leaf keys = 440, `fr-CA.json` = 440, symmetric difference = 0 |
| 15 | Cross-references resolve | PASS | 132 relative links (file + `#anchor`, GitHub-style slugs) across A, B and side files; broken = [] |
| 16 | Mermaid blocks declare a supported diagram type | PASS | 5 blocks: A 04 `flowchart`, A 09 `stateDiagram-v2`, A 24 `flowchart` ×2 + `sequenceDiagram`. Full Mermaid parse not run (no Mermaid CLI installed) |
| 17 | Extraction status 100 % complete | PASS | `extraction-status.md`: `A 01–24 ✅`, `B 01–11 ✅`, ⏳ count = 0 |
| 18 | Change tracker: sessions logged, source version recorded | PASS | Rows 1 (scaffold), 2 (A), 3 (B); header "0.1.0 @ `bbb4907…`" |
| 19 | Contract + type check (repo tooling) | PASS | `npm run verify` → `openapi-typescript … --check` (7.13.0) then `tsc -b`; exit 0 (run twice: during extraction and after the fixes) |
| 20 | Production build (repo tooling) | PASS | `vite build --outDir $TMPDIR/ew-web-dist`: 124 modules; `index.html` 0.52 kB, CSS 22.59 kB (5.12 kB gzip), JS 466.15 kB (140.42 kB gzip) — figures quoted in A 16.1 and B 09.1 |

### UNVERIFIED — Tier J, not attested (11 items)

| # | Check | Why it needs judgment | What I observed |
|---|---|---|---|
| 1 | Every documented behaviour traced to a specific source location | Deciding that a prose description matches code behaviour is interpretation | Each claim was written while reading the cited file; all 33 hand-written source files were read in full |
| 2 | Default values match actual code defaults | Choosing which construct is "the default" is interpretive | Spot-read: performance range `1Y`, price range `1M`, transactions filter `all`, account type `TFSA`, security questions `q1`/`q2`, goal category `Home`, meeting type from saved preference else `video`, province fallback `ON` |
| 3 | Prop shapes and type signatures exact | Tables simplify some types for readability | A 07 prop tables abbreviate (e.g. `options: {id, label}[]`); A 06.2 `AuthContextValue` omits parameter types |
| 4 | No contradictions between Part A and Part B | Requires reading both for meaning | Shared facts (URLs, 47/49 ops, timers, bundle sizes, locales, storage) were written from the same source reads; no contradiction noticed |
| 5 | No internal details leaked into Part B | "Internal" is a judgment call | B names a few internals deliberately to justify "not supported" (`sessionStorage`, `ew:unauthorized` event, `src/i18n/*.json`, `project.toml` flags); user chose the evidence-based Part B style |
| 6 | Terminology consistent | Judgment | Same terms used for auth phases, deep links, sign-out reasons; "enrolment" and "registration" both used (glossary links them) |
| 7 | Parts Affected values correct | Judgment | Tracker rows: scaffold = Both, A-only, B-only |
| 8 | Route guards / auth boundaries verified against source | Behavioural reading of `App.tsx` phase switch and `AuthContext` | Documented in A 05.2 / 09; return-to-origin and `/register`-when-signed-in → NotFound derived from code, not executed |
| 9 | Cross-repo facts (API behaviour) | Taken from the API's Part A docs, not re-derived from API source | Access TTL 900 s, refresh rotation, MFA ignores `challengeId`/`method`, 404 for other users' resources, 300 req/min/IP — matched against `electric-wealth-api-spring/docs/api-internal/08`, `07`, `23` and `Accept-Language` usage confirmed by grep in API controllers |
| 10 | Known-issues list (A 20) is accurate and complete | Identifying defects is judgment | 15 items, each found by reading the cited code; none reproduced in a browser |
| 11 | Spot-check of features against source | Sample cannot attest the population | Sample 5 of 11 feature areas re-read against their docs: Accounts, Advisor, Documents, Registration, Settings. Discrepancies found and corrected while writing: greeting text, notification deep-link field, default account name, locale-keyed query claim, profile "contact" text, auth error strings |

### Failures

None outstanding. Fixed during verification (before the final run):

| Check | Problem | Fix |
|---|---|---|
| 4 | `A 05` line 25 quoted JSX `state={{ returnTo }}`; `A 14` line 43 had an i18next `{{name}}` comment — both matched the template-placeholder pattern | Reworded both lines without the double braces |
| 12 | `Segmented` appeared only as `Segmented<T>` in A 07 | Table cell now reads `Segmented` (generic `<T extends string>`) |

### Recommendations

1. **Before `build-knowledge-base`:** none required; the mechanical gate is GO. The UNVERIFIED list travels with the
   extraction.
2. **Optional human pass** on Part B (UNVERIFIED #5): confirm the evidence-based "not supported" style is what KB readers
   want.
3. **Product follow-ups** surfaced by the extraction (A 20 "Known issues"), highest value first: apply the saved language
   preference on sign-in (#1); page the accounts list (#2); add an error boundary (#4); handle download and search
   errors (#5, #6); remove demo hints before any non-demo use (#13); add tests (#15).
4. **Deployment decision needed** before any hosted environment: same-origin `/api` reverse proxy and the API's per-IP
   rate limit (B 01.6, B 09.5).
