# jfv-app-api

Write-only API and Contentful OAuth broker for `jfv-app`.

## Endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/login` | Start Contentful OAuth |
| `GET` | `/api/auth/callback` | Exchange the OAuth code and create a session |
| `GET` | `/api/auth/me` | Return the current user or `401` |
| `POST` | `/api/auth/logout` | Delete the session and clear the cookie |
| `POST` | `/api/plants/:id/plant` | Add the `planted` tag and `plantedAt` |
| `POST` | `/api/plants/:id/dead` | Add the `dead` tag and `declaredDeadAt` |
| `GET` | `/api/health` | Health check |

Write requests require:

- A valid `jfv_session` cookie.
- An allowed Contentful user.
- `X-Requested-With: jfv-app`.
- An allowed `Origin`.

## Auth flow

1. The PWA navigates to `/api/auth/login`.
2. The API stores a signed OAuth `state` cookie and redirects to Contentful.
3. Contentful redirects back to `/api/auth/callback`.
4. The API exchanges the code, verifies the Contentful user, checks the allowlist, and creates a session.
5. The session ID is stored in an HttpOnly cookie; Contentful tokens stay in Redis.
6. Writes use the logged-in user's Contentful access token, so Contentful permissions and audit logs apply.

## Contentful OAuth application

Create a **confidential** OAuth application in Contentful account settings with:

- Redirect URI: `https://api.example.com/api/auth/callback`
- Scope: `content_management_manage`
- `confidential: true`

A public OAuth application will issue authorization codes, but the token exchange will fail because this API uses a client secret. If login returns to the app with `auth=error`, verify the app’s confidentiality flag in Contentful.

Create separate OAuth applications for staging and production. For local OAuth testing, use an HTTPS tunnel or a staging deployment; Contentful requires an HTTPS redirect URI.

## Cookies and domains

Prefer custom domains under the same parent site:

- `https://map.example.com` for `jfv-app`
- `https://api.example.com` for `jfv-app-api`

This keeps the session cookie same-site with `SameSite=Lax`. If the app and API are on different sites, set `COOKIE_SAME_SITE=none`; the cookie will be marked `Secure`.

## Session storage

Sessions use Upstash Redis via `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, with `KV_REST_API_URL` / `KV_REST_API_TOKEN` accepted as fallbacks.

Outside production, if Redis is not configured, the API falls back to an in-memory session store for local development. Production requires Redis.

## Environment

See `.env.example`. The required values are:

- Contentful OAuth client ID, secret, redirect URI, and scope
- Contentful space and environment
- At least one allowed user ID or email
- `SESSION_SECRET`
- `APP_ORIGIN`
- Redis credentials in production

## Development

Use Node 22 or 24 (see the root `.nvmrc`). Link the Vercel project once, then start the dev server:

```bash
npx vercel@latest link
pnpm --filter jfv-app-api dev
```

Do not use `vercel dev --local`: without linked project settings, the CLI falls back to a static build for the project root, which an API-only project does not define. Node 26 also no longer bundles Corepack; use Node 22/24, or install Corepack separately if you must stay on Node 26.

Run tests with:

```bash
pnpm --filter jfv-app-api test
```
