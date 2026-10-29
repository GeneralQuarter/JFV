# Local development on `jfv.local`

Caddy serves the PWA and API from one HTTPS origin:

```text
https://jfv.local/          -> Vite PWA on 127.0.0.1:3001
https://jfv.local/api/*     -> jfv-app-api on 127.0.0.1:3000
```

This keeps the session cookie same-origin and gives Contentful a stable HTTPS callback:

```text
https://jfv.local/api/auth/callback
```

## One-time setup

Run from an elevated PowerShell:

```powershell
Start-Process powershell -Verb RunAs -ArgumentList '-ExecutionPolicy','Bypass','-File','E:\DEV\JFV\monorepo\dev\setup-local.ps1'
```

This adds `127.0.0.1 jfv.local` to the hosts file and runs `caddy trust`.

`jfv.localhost` is also configured in the Caddyfile as a no-hosts fallback, but the OAuth callback is registered for `jfv.local`.

## Start the dev stack

In three terminals:

```powershell
pnpm dev:api
pnpm dev:jfv-app
caddy run --config dev/Caddyfile
```

If `caddy` is not on PATH yet, reopen the terminal or use the full path shown by:

```powershell
Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter caddy.exe
```

Open:

```text
https://jfv.local
```

## Contentful OAuth dev app

Create a separate OAuth application for development:

- Redirect URI: `https://jfv.local/api/auth/callback`
- Confidential client
- Scope: `content_management_manage`

Put its client ID and secret in `apps/jfv-app-api/.env.local`.

## Env values

`apps/jfv-app-api/.env.local`:

```env
CONTENTFUL_OAUTH_REDIRECT_URI=https://jfv.local/api/auth/callback
APP_ORIGIN=https://jfv.local
ALLOWED_ORIGINS=https://jfv.local
COOKIE_SAME_SITE=lax
```

`apps/jfv-app/.env.local`:

```env
VITE_API_BASE_URL=https://jfv.local
```

## Notes

- The API uses an in-memory session store when Redis is not configured outside production.
- Dev writes still hit the Contentful space configured in `CONTENTFUL_SPACE_ID`; use a test entry or a separate Contentful environment if possible.
- If port 443 is busy, change the Caddyfile to `https://jfv.local:8443`, update the OAuth redirect URI, `APP_ORIGIN`, `ALLOWED_ORIGINS`, and `VITE_API_BASE_URL` accordingly.
