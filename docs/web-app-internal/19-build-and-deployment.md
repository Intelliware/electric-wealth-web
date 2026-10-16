---
title: "Build and Deployment"
block: reverse-eng/web-app/internal/build-and-deployment
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 19. Build and Deployment

### 19.1 Build Process

```bash
npm run build      # tsc -b && vite build  → dist/
npm run preview    # serve dist/ locally
```

1. `tsc -b` type-checks `tsconfig.app.json` (src) and `tsconfig.node.json` (`vite.config.ts`); `noEmit`, so it only
   fails or passes.
2. `vite build` with `@vitejs/plugin-react` bundles from `index.html` → `src/main.tsx` into `dist/`: one HTML file, one
   hashed CSS file, one hashed JS file, plus `public/favicon.svg` copied as is. No source maps are configured
   (Vite's default is off). Output from the 2026-10-16 build: see [16.1](16-performance-patterns.md#161-code-splitting).
3. `dist/` and `*.tsbuildinfo` are git-ignored.

`npm run gen:api` is **not** part of the build. Run it (and commit `schema.d.ts`) whenever the API's `openapi.json`
changes; `npm run verify` tells you when it is needed.

### 19.2 Deployment Environments

**No deployment exists in the repo:** no Dockerfile, hosting config, CI/CD, environment files beyond `.env.example`, or
production URL. The only documented way to run the app is the local dev setup ([02.3](02-environment-and-configuration.md#23-installation-and-setup)).

| Environment | How it runs | API target |
|---|---|---|
| Local dev | `npm run dev` on http://localhost:5173 (HMR) | `/api` proxied to `API_URL` (default `http://localhost:4200`) |
| Local preview | `npm run preview` serving `dist/` | Vite's `preview.proxy` defaults to `server.proxy`, so `/api` is proxied the same way |

**Requirements for any real deployment** (derived from the code, not from existing config):

- Serve `dist/` as static files with an **SPA fallback** to `index.html` (routes use the History API via
  `BrowserRouter`; deep URLs like `/accounts/a1` must not 404).
- Serve the API on the **same origin** under `/api/*` (reverse proxy), because the client calls
  `window.location.origin` and has no configurable API base URL. Calling a different origin would also require
  `CORS_ORIGINS` on the API.
- Serve over HTTPS and add security headers (CSP, etc.) at the host; none exist today.
- Hashed assets in `dist/assets/` can be cached long-term; `index.html` should not be.
- Remove the demo hints and pre-filled login before any real use (see [17.2](17-security-implementation.md#172-sensitive-data-handling)).

