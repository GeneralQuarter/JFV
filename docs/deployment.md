# Deployment and cutover

This document describes how the JFV monorepo is deployed and how to cut over from the legacy apps.

## Vercel projects

Create one Vercel project per deployed app. For every project:

- Set **Root Directory** to the app folder, for example `apps/jfv-app`.
- Enable **Include source files outside of the Root Directory in the Build Step**.
- Use **Node.js 22**.
- Let Vercel detect the root `pnpm-lock.yaml`.
- Set the environment variables listed below for each environment (Preview / Production).
- Use stable custom domains for staging and production.

| Project | Root Directory | Build command | Output |
| --- | --- | --- | --- |
| `jfv-app` | `apps/jfv-app` | `pnpm build` | `dist` |
| `jfv-app-api` | `apps/jfv-app-api` | Vercel functions | — |

The checked-in `vercel.json` files set the build command, output directory, and PWA cache headers. Vercel detects the root `pnpm-lock.yaml` and installs the workspace dependencies automatically.

Build skipping is intentionally not configured in the repo. A git-diff-based ignored-build step prevents manual redeploys after environment-variable-only changes, which is exactly when the API usually needs to restart. Configure an Ignored Build Step in the Vercel project settings only if you want that trade-off, and remember to disable it when redeploying for env changes.

`plants-map-page` is deployed as a **Contentful-hosted bundle** instead of a Vercel project. The current build is 4 files / ~2.7 MB, within Contentful's 10 MB and 500-file bundle limits, and uses relative asset paths. A Vercel deployment remains an option for previews, but it is not needed for production.

### PWA strategy for `jfv-app`

Production uses the default `pnpm build` (`generateSW`), which generates `sw.js` automatically. Use `pnpm build-sw` only when testing the `injectManifest`/prompt-based service worker.

`apps/jfv-app/vercel.json` sets `Cache-Control: public, max-age=0, must-revalidate` for `/sw.js` so new service workers are picked up.

## Environment variables

### `jfv-app`

Copy from `apps/jfv-app/.env.example`:

- `VITE_API_BASE_URL` — public URL of `jfv-app-api`
- `VITE_CONTENTFUL_SPACE`
- `VITE_CONTENTFUL_ACCESS_TOKEN` — Contentful Delivery API token
- `VITE_SW` / `VITE_SW_DEV` / `VITE_SYNC_IN_DEV` — optional feature flags

### `jfv-app-api` project setup

This project has **no build command** on purpose. Vercel detects the files in `api/` as serverless functions and bundles them automatically.

Create the project with:

- **Root Directory:** `apps/jfv-app-api`
- **Include source files outside of the Root Directory:** enabled
- **Framework Preset:** Other (the checked-in `vercel.json` sets `"framework": null`)
- **Build Command:** leave empty (functions are deployed without a build)
- **Output Directory:** leave empty
- **Install Command:** default (`pnpm` is detected from the root lockfile)
- **Node.js Version:** 22

The function duration and framework are set in `apps/jfv-app-api/vercel.json`. After the first deploy, open `https://<api-project>.vercel.app/api/health` to confirm the function runtime is working, then add the custom API domain and update the Contentful OAuth redirect URI.

For local API development, link the project once with `npx vercel@latest link` and use `pnpm --filter jfv-app-api dev`. Avoid `vercel dev --local` for this project: without linked project settings it attempts a static build of the root and fails because the API has no static output. Use Node 22/24, since Node 26 no longer bundles Corepack.

Copy environment values from `apps/jfv-app-api/.env.example`. Production requires:

- Contentful OAuth: client ID, client secret, redirect URI, scope
- Contentful space and environment
- At least one entry in `CONTENTFUL_ALLOWED_USER_IDS` and/or `CONTENTFUL_ALLOWED_USER_EMAILS`
- `SESSION_SECRET` (32+ random characters)
- `APP_ORIGIN` — the `jfv-app` frontend origin, not the API origin; the OAuth callback redirects here
- `ALLOWED_ORIGINS` — frontend origins allowed to call the API
- Upstash `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or the `KV_REST_API_*` fallbacks)

Create separate **confidential** Contentful OAuth applications for staging and production. The redirect URI must be HTTPS and point at `/api/auth/callback`.

Prefer sibling custom domains, for example:

- `https://map.example.com` → `jfv-app`
- `https://api.example.com` → `jfv-app-api`

That keeps the session cookie same-site with `SameSite=Lax`. Otherwise set `COOKIE_SAME_SITE=none`.

### `plants-map-page`

The editor gets Contentful access through the App SDK, so it has no runtime environment variables. During local development, point the Page location URL at `https://editor.localhost`. For staging and production, upload the built app as a Contentful bundle and select the bundle as the app definition source.

## Contentful app definitions

| App | Location | Deployment |
| --- | --- | --- |
| `plants-map-page` | Page | Contentful-hosted bundle |
| `sidebar-plants` | Entry sidebar (`PlantCommonInfo`) | Contentful-hosted bundle |
| `field-editor-full-latin-name` | Field editor | Contentful-hosted bundle |
| `field-editor-plant-code` | Field editor | Contentful-hosted bundle |

Use separate app definitions for local development and staging/production. The local definition points its Page location at `https://editor.localhost`; staging and production use uploaded bundles.

### Contentful-hosted bundles

Build and upload each app:

```bash
pnpm --filter plants-map-page build
pnpm --filter plants-map-page upload:ci

pnpm --filter sidebar-plants build
pnpm --filter sidebar-plants upload:ci

pnpm --filter field-editor-full-latin-name build
pnpm --filter field-editor-full-latin-name upload:ci

pnpm --filter field-editor-plant-code build
pnpm --filter field-editor-plant-code upload:ci
```

`upload:ci` expects:

- `CONTENTFUL_ORG_ID`
- `CONTENTFUL_APP_DEF_ID`
- `CONTENTFUL_ACCESS_TOKEN` (a Contentful personal access token for CI)

Use separate app definitions for staging and production. Remove any Vercel project for a micro app after its Contentful bundle is verified, so there is only one deployment path in production.

## Staging validation

Install the new app definitions side by side with the legacy apps and check:

- Plants, plant cards, hedges, rectangles, zones, and sectors render correctly.
- Plant selection, quick actions, tags, and tag filters work.
- Plant moving works; planted plants are locked.
- Rectangle/zone selection, moving, and rectangle rotation work.
- Search returns results and flies to each feature type.
- CSV measured-point import, Ctrl/Cmd assignment, coordinate copy, and JSON marking work.
- Measurements can be created and removed.
- Add plant, Add plant card, and Draw sector work and persist to Contentful.
- Multi-selection export produces the expected CSV.
- The editor switches between English and French with the Contentful UI language.
- No console errors, network 4xx/5xx, or unexpected read-only states.

Compare hedges, labels, canopy sizing, and map colours with the legacy editor during the same session.

## Cutover

1. Deploy staging and complete the validation checklist.
2. Configure production Vercel projects and environment variables for `jfv-app` and `jfv-app-api`.
3. Build and upload the production `plants-map-page` bundle, then set the app definition source to that bundle.
4. Deploy production `jfv-app-api`, then `jfv-app`.
5. Verify login, reads, one plant action, and one editor write in production.
6. Keep the legacy apps deployed for rollback.

### Rollback

Point the Page app definition back to the legacy `plants-map` URL, or select the previous editor bundle if you are rolling back to an earlier editor build. The legacy apps and their Vercel projects remain untouched until the new editor has been stable for an agreed period.

### After cutover

- Remove the legacy Page app definition from the production space.
- Archive `treeviewer-api` when `jfv-map` is retired.
- Remove the legacy apps from Vercel once the rollback window has passed.

## Troubleshooting login

If OAuth completes (you land on `APP_ORIGIN?auth=success`) but the app shows the failed-connection banner, check `https://<api-domain>/api/health` first:

- `sessionStore: "redis"` — expected in production.
- `sessionStore: "missing"` — set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` and redeploy.
- `sessionStore: "file"` — `NODE_ENV` is probably set to `development` in Vercel; remove it so file sessions are not used across instances.

Then inspect the browser. After the callback, `jfv_session` should appear under Application → Cookies for the API domain, and the `/api/auth/me` request should send it. If it is missing, confirm the callback response has a `Set-Cookie: jfv_session=...` header and that `APP_ORIGIN` and the API share the same parent domain with `COOKIE_SAME_SITE=lax`. If the cookie is present but `/me` still returns 401, verify that the deployment serving `/me` uses the same Upstash database that handled the callback.

Each session store returns a parsed `Session`, so `readSession` must not `JSON.parse` the value again. Upstash deserializes JSON values by default; parsing the returned object throws and makes every authenticated request look unauthenticated even though the session key exists.

## Known intentional differences

- Water mode and 3D are not part of the Page editor.
- Permissions are not gated in the editor; all editors are expected to share the same Contentful permissions.
- Zone drawing is not implemented; sectors can be drawn, zones can be moved and edited.
- Measured points and measurements are session-only, matching the legacy editor.
- The `Marked` tag imported from JSON is temporary and is not persisted to Contentful.
