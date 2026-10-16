---
title: "Environment and Configuration"
block: reverse-eng/web-app/internal/environment-and-configuration
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 2. Environment and Configuration

### 2.1 Prerequisites for Development

| Tool | Version | Source |
|---|---|---|
| Node.js | 24 (`engines.node: ">=24"`; workshop standard `24.19.0`) | [package.json](../../package.json), [.nvmrc](../../.nvmrc) |
| npm | bundled with Node 24 (`package-lock.json` committed) | — |
| Java | 21 — to run the Spring API | [README.md](../../README.md) |
| Sibling repos | `electric-wealth-db` and `electric-wealth-api-spring` cloned next to this repo | `gen:api` path `../electric-wealth-api-spring/openapi.json` |

`package.json` sets `"allowScripts": { "fsevents": false }`, so npm does not run the `fsevents` install script.

### 2.2 Browser Support

No `browserslist`, no polyfills and no Vite `build.target` override, so the output targets Vite 8's default modern
browser baseline. The TypeScript target is `ES2022` with `DOM` / `DOM.Iterable` libs
([tsconfig.app.json](../../tsconfig.app.json)). The code relies on: `Intl.NumberFormat` / `Intl.DateTimeFormat`,
`<dialog>.showModal()` (document sharing), `<details>` (user menu), `color-mix()` in CSS, `prefers-color-scheme`,
`sessionStorage` / `localStorage`, Unicode property escapes in regexes (`/\p{L}/u` in `initials`), and
`HTMLFormElement.requestSubmit()` (message composer). No browser matrix is documented or tested.

### 2.3 Installation and Setup

From [README.md](../../README.md):

```bash
# Terminal 1: database + Spring API
cd electric-wealth-db  && npm run db:reset
cd ../electric-wealth-api-spring && ./mvnw spring-boot:run

# Terminal 2: web app
cd electric-wealth-web && npm install && npm run dev
```

Open http://localhost:5173 and sign in as `sarah.chen@example.com` / `Demo123!`, MFA code `123456`. The login form
pre-fills `sarah.chen@example.com` ([AuthPages.tsx](../../src/features/auth/AuthPages.tsx)).

To point at a different API, copy `.env.example` to `.env` and change `API_URL`.

### 2.4 Environment Variables

| Variable | Default | Read by | Effect |
|---|---|---|---|
| `API_URL` | `http://localhost:4200` | [vite.config.ts](../../vite.config.ts) via `loadEnv(mode, process.cwd(), '')` | Target of the dev-server proxy for `/api`. Dev server and `vite preview` only. |

There are **no** `VITE_*` variables: nothing from the environment is compiled into the browser bundle. The browser
always calls `window.location.origin` + `/api/...` ([client.ts](../../src/api/client.ts)). `.env` is git-ignored;
[.env.example](../../.env.example) documents the one variable.

### 2.5 Build and Runtime Configuration

| File | Setting | Value |
|---|---|---|
| [vite.config.ts](../../vite.config.ts) | `plugins` | `react()` |
| | `server.port` | `5173` |
| | `server.proxy` | `{ '/api': API_URL }` |
| [tsconfig.json](../../tsconfig.json) | project references | `tsconfig.app.json` (src), `tsconfig.node.json` (vite.config.ts) |
| [tsconfig.app.json](../../tsconfig.app.json) | `target` / `module` / `moduleResolution` | `ES2022` / `ESNext` / `bundler` |
| | strictness | `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` |
| | other | `jsx: react-jsx`, `resolveJsonModule` (locale JSON imports), `noEmit`, `types: ["vite/client"]` |
| [index.html](../../index.html) | `<html lang>` | `en-CA` (rewritten at runtime by i18n) |
| | `<meta name="color-scheme">` | `light dark` |
| [main.tsx](../../src/main.tsx) | React Query defaults | `staleTime` 30 s, `retry` once for network/5xx only, `refetchOnWindowFocus: false` |

Runtime configuration that is **hard-coded** (not configurable): idle timeout 15 min, refresh interval 10 min,
notifications polling 60 s, page sizes (accounts 20, transactions 10, documents 100, goals 100). See
[23](23-quick-reference.md).

### 2.6 Development Tools and Commands

| Command | Runs | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Dev server with HMR on :5173, proxying `/api` |
| `npm run gen:api` | `openapi-typescript ../electric-wealth-api-spring/openapi.json -o src/api/schema.d.ts` | Regenerate API types after an API change |
| `npm run check:api` | same with `--check` | Fail if `schema.d.ts` is stale |
| `npm run typecheck` | `tsc -b` | Type-check app and Vite config |
| `npm run verify` | `check:api && typecheck` | The "ready to push" check (README) |
| `npm run build` | `tsc -b && vite build` | Production build to `dist/` |
| `npm run preview` | `vite preview` | Serve `dist/` locally |

No linter, formatter, test runner or git hooks are configured.

