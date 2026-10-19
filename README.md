# electric-wealth-web

The browser app for Electric Wealth.

## Getting started

Prerequisites: **Node.js 24** (workshop standard: 24.19.0, see `.nvmrc`) and **Java 21**. Clone `electric-wealth-db`, `electric-wealth-api` and `electric-wealth-web` side by side, then:

```bash
# Terminal 1: database + Spring API
cd electric-wealth-db  && npm run db:reset
cd ../electric-wealth-api && ./mvnw spring-boot:run

# Terminal 2: web app
cd electric-wealth-web && npm install && npm run dev
```

Open http://localhost:5173 and sign in as `sarah.chen@example.com` / `Demo123!`, MFA code `123456`.

The dev server forwards `/api/*` requests to the Spring API at `http://localhost:4200` by default. Override this by setting `API_URL` in `.env`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run gen:api` | Regenerate `src/api/schema.d.ts` from `../electric-wealth-api/openapi.json` |
| `npm run check:api` | Fail if `schema.d.ts` is out of date |
| `npm run typecheck` | Type-check the app |
| `npm run verify` | check:api + typecheck: the "ready to push" check |
| `npm run build` / `npm run preview` | Production build / serve the build locally |
