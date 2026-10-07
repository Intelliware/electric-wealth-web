# electric-wealth-web

The browser app for Electric Wealth.

## Getting started

Prerequisite: **Node.js 24** (workshop standard: 24.19.0, see `.nvmrc`). Clone the three repos side by side, then:

```bash
# Terminal 1: database + API
cd electric-wealth-db  && npm run db:reset
cd ../electric-wealth-api && npm install && npm run dev

# Terminal 2: web app
cd electric-wealth-web && npm install && npm run dev
```

Open http://localhost:5173 and sign in as `sarah.chen@example.com` / `Demo123!`, MFA code `123456`.

The dev server forwards `/api/*` requests to the API (default `http://localhost:4100`). To point at a different API, create `.env` with `API_URL=http://localhost:4200`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run gen:api` | Regenerate `src/api/schema.d.ts` from `../electric-wealth-api/openapi.json` |
| `npm run check:api` | Fail if `schema.d.ts` is out of date |
| `npm run typecheck` | Type-check the app |
| `npm run verify` | check:api + typecheck: the "ready to push" check |
| `npm run build` / `npm run preview` | Production build / serve the build locally |
