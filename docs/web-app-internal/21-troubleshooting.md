---
title: "Troubleshooting"
block: reverse-eng/web-app/internal/troubleshooting
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 21. Troubleshooting

### 21.1 Common Issues and Solutions

| Symptom | Likely cause | Fix |
|---|---|---|
| Every page shows the generic error; `/api/...` requests fail and the dev-server terminal logs `http proxy error` | Spring API not running, or `API_URL` wrong | Start the API (`./mvnw spring-boot:run` in `electric-wealth-api-spring`), check `.env` `API_URL` (default `http://localhost:4200`) |
| "Invalid email or password" for a demo user | Database not seeded, or wrong password | `npm run db:reset` in `electric-wealth-db`; password `Demo123!` |
| "Invalid verification code" at MFA | Wrong code | Demo code is `123456` |
| `npm run check:api` fails | `openapi.json` changed in the API repo | `npm run gen:api`, then `npm run typecheck` and fix the reported call sites |
| `check:api` / `gen:api` "file not found" | API repo not cloned next to this one | Clone `electric-wealth-api-spring` as a sibling folder |
| Signed out with "Your session expired. Please sign in again." | A protected call returned `401` (API restarted with a fresh DB, token revoked) or refresh failed | Sign in again |
| Signed out with "after 15 minutes of inactivity" | Idle timeout | Expected; constant `IDLE_TIMEOUT_MS` in `AuthContext.tsx` |
| Closing and reopening the tab requires sign-in | Tokens live in `sessionStorage` | Expected |
| Language differs from the one chosen on another browser or device | The saved `language` preference is not applied on sign-in (issue 1 in [20](20-anti-patterns.md)); each browser uses its own `localStorage` value or the browser language | Use the toggle; it is remembered per browser |
| Refreshing a deep URL in a deployed build returns 404 | Host has no SPA fallback | Rewrite unknown paths to `index.html` |
| Deployed build cannot reach the API | API not on the same origin under `/api` | Reverse-proxy `/api` to the API (no configurable base URL) |
| "Too many requests" style failures during heavy use | API rate limit 300 requests/min per IP (`429 RATE_LIMITED`), shown as the generic error | Wait a minute; the UI does not retry 4xx |
| Booking says "That time was just taken" | `SLOT_UNAVAILABLE` from the API | Pick another slot; the list refreshes automatically |
| Registration jumps back to step 1 | `REGISTRATION_NOT_FOUND` — the API's draft expired (30 min) | Start again |
| Node version errors | Node < 24 | `nvm use` (reads `.nvmrc` = 24.19.0) |

