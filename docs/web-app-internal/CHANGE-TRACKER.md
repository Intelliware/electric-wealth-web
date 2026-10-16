---
title: "Change Tracker — electric-wealth-web documentation"
skill: reverse-engineer-web-app
source_repo: electric-wealth-web
---

# Change Tracker — electric-wealth-web documentation

### Header

| Field | Value |
|---|---|
| Artifact | Electric Wealth Web App — reverse-engineered documentation |
| Artifact type | RE package (Part A internal + Part B consumer/integration guide) |
| Current source version | 0.1.0 @ `bbb4907dd0d866223742c529ea65a75ec8af576f` (branch `kb1`) |
| Current artifact version | 0.1.0-doc.1 |
| Stage / Skill of record | reverse-engineering / `reverse-engineer-web-app` |
| last_verified_against_commit | `bbb4907dd0d866223742c529ea65a75ec8af576f` (2026-10-16, automated, MECHANICAL: GO) |

### Versioning Convention

`X.Y.Z-doc.N` — `X.Y.Z` is the web app's `package.json` version; `N` increments for each documentation revision
against that source version.

### Parts Affected — Reference

| Value | Meaning |
|---|---|
| A | Part A — internal docs in `docs/web-app-internal/` (this repo) |
| B | Part B — `<KB>/source-docs/electric-wealth-web/web-app-consumer/` |
| Both | A and B |

KB root: `/Users/kosta/repos/em/ElectricWeatlhParent/electric-wealth-knowledge-base`.

### Change Types

Initial Extraction · Correction · Source Update · Restructure · Addition · Deprecation · Removal · Verified.

### Change Log

#### 0.1.0-doc.1 — 2026-10-16

| # | Date | Change Type | Parts Affected | Section / File | Description | Source Version | Verified |
|---|---|---|---|---|---|---|---|
| 4 | 2026-10-16 | Verified | Both | [verification-report.md](verification-report.md) | RE close-out gate, automated mode (user choice): 20 Tier M checks passed, 0 failed (incl. `npm run verify` and a production build); 11 Tier J items UNVERIFIED. 3 marker/inventory issues fixed during verification (A 05, A 07, A 14). | 0.1.0 @ bbb4907 | automated (MECHANICAL: GO; 11 UNVERIFIED) |
| 3 | 2026-10-16 | Initial Extraction | B | `web-app-consumer/01…11` (11 files) | Consumer/integration guide: standalone-only deployment shape and URL contract, deep links, API dependency (47/49 ops), session rules, locales, performance and rate-limit note, versioning; unsupported surfaces stated with evidence. | 0.1.0 @ bbb4907 | 🔵 see row 4 |
| 2 | 2026-10-16 | Initial Extraction | A | `01…24` (24 files), `extraction-status.md` | Full Part A extraction from every file in `src/` (except generated `schema.d.ts`), config files and README. Also recorded `has_forms` / `has_i18n` in `project.toml`. | 0.1.0 @ bbb4907 | 🔵 see row 4 |
| 1 | 2026-10-16 | Restructure | Both | A `01…24`, B `01…11`, `extraction-status.md` | Scaffold from `re-web-app-internal` / `re-web-app-consumer` compositions; `has_forms` and `has_i18n` true; optional B 12 omitted. | 0.1.0 @ bbb4907 | n/a |

### Cross-Part Synchronisation

| If this changes… | Check… |
|---|---|
| `src/App.tsx` routes | A 05, 13, extraction-status route table; B 01 (URL contract) |
| `src/lib/deepLinks.ts` | A 05.3; B 01, 04 |
| `src/api/hooks.ts` / `client.ts`, or `openapi.json` (run `npm run gen:api`) | A 06, 08, 10; B 04, 09 |
| `src/auth/*` | A 09, 17; B 05 |
| `src/i18n/*` or locale JSON | A 14; B 08 |
| `src/styles.css` tokens / themes | A 11; B 02 |
| `vite.config.ts`, `.env.example`, `package.json` | A 02, 19, 23; B 01, 09, 10 |
