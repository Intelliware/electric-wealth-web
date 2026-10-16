---
title: "Security Implementation"
block: reverse-eng/web-app/internal/security-implementation
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 17. Security Implementation

### 17.1 Security Practices

| Area | Practice | Source |
|---|---|---|
| Transport | Same-origin calls only (`baseUrl: window.location.origin`); the dev proxy forwards to the API. No CORS needed in dev. HTTPS is a deployment concern (none configured) | `client.ts`, `vite.config.ts` |
| Authentication | Bearer access token (15 min) + rotating refresh token; MFA before any protected call | `AuthContext.tsx` |
| Session end | Idle timeout 15 min; refresh every 10 min; server-side revoke on logout; local sign-out even if revoke fails; global 401 → sign-out | `AuthContext.tsx`, `client.ts` |
| Cache hygiene | `queryClient.clear()` on every logout, so the next user in the tab sees no previous data | `AuthContext.tsx` |
| XSS | All text rendered through React (escaped); no `dangerouslySetInnerHTML`, no `eval`, no user HTML | `src/**` |
| Secrets | None in the bundle: no `VITE_*` variables, no API keys | `vite.config.ts` |
| Data minimisation | The API returns masked phone and SIN; the UI never sees full values | `ProfilePage.tsx` |
| Balance privacy | "Hide balances" toggle on the accounts page (local, not persisted) | `AccountsPage.tsx` |
| Document download | Generated `Blob` URL revoked right after the click | `DocumentsPage.tsx` |

**Not present:** Content-Security-Policy, other security headers (these would come from the hosting server — there is
none in the repo), Subresource Integrity, CSRF tokens (not needed: auth is a header, not a cookie), client-side rate
limiting, or brute-force lockout (server responsibility; the API has none either).

### 17.2 Sensitive Data Handling

| Data | Where it lives in the browser | Notes |
|---|---|---|
| Access + refresh tokens | `sessionStorage['ew_tokens']` (JSON) and a module variable | Readable by any script on the origin (XSS would expose them). Per-tab; cleared on tab close and logout. The refresh token never expires on the API until used or revoked |
| Password | Component state only, sent once to `/api/auth/token` or `/api/registration/start` | Not stored |
| MFA code | Component state only | Fixed demo code `123456` on the API |
| Registration identity data (account number, postal code, DOB, security answers) | Component state during the wizard | Not stored |
| Financial data | TanStack Query in-memory cache | Cleared on logout; not persisted |
| Locale | `localStorage['ew_locale']` | Not sensitive |

Demo-only behaviour that must not reach production: login pre-fills `sarah.chen@example.com`; the login, MFA and
registration screens print the demo password, MFA code and demo identities (`web.demo_hint`, `web.mfa_demo_hint`,
`web.register_demo_hint`).


---

# Part 7 — Quality and Maintenance
