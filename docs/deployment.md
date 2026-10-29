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
| `plants-map-page` | `apps/plants-map-page` | `pnpm build` | `build` |

The checked-in `vercel.json` files set the build command, output directory, PWA cache headers, and an ignored-build step that skips deploys when only unrelated files changed. Vercel detects the root `pnpm-lock.yaml` and installs the workspace dependencies automatically.

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

### `jfv-app-api`

Copy from `apps/jfv-app-api/.env.example`. Production requires:

- Contentful OAuth: client ID, client secret, redirect URI, scope
- Contentful space and environment
- At least one entry in `CONTENTFUL_ALLOWED_USER_IDS` and/or `CONTENTFUL_ALLOWED_USER_EMAILS`
- `SESSION_SECRET` (32+ random characters)
- `APP_ORIGIN` and `ALLOWED_ORIGINS`
- Upstash `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or the `KV_REST_API_*` fallbacks)

Create separate **confidential** Contentful OAuth applications for staging and production. The redirect URI must be HTTPS and point at `/api/auth/callback`.

Prefer sibling custom domains, for example:

- `https://map.example.com` → `jfv-app`
- `https://api.example.com` → `jfv-app-api`

That keeps the session cookie same-site with `SameSite=Lax`. Otherwise set `COOKIE_SAME_SITE=none`.

### `plants-map-page`

The editor gets Contentful access through the App SDK, so it has no runtime environment variables. Its Page location URL must be the deployed editor URL:

```text
https://<plants-map-page-project>.vercel.app
```

During local development use `https://editor.localhost`.

## Contentful app definitions

| App | Location | Deployment |
| --- | --- | --- |
| `plants-map-page` | Page | Vercel |
| `sidebar-plants` | Entry sidebar (`PlantCommonInfo`) | Contentful-hosted bundle |
| `field-editor-full-latin-name` | Field editor | Contentful-hosted bundle |
| `field-editor-plant-code` | Field editor | Contentful-hosted bundle |

For local editor development, the Page location URL is `https://editor.localhost`. For staging and production, point it at the matching Vercel deployment.

### Contentful-hosted bundles

Build and upload each micro app:

```bash
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
2. Configure production Vercel projects and environment variables.
3. Install the production Contentful app definitions.
4. Deploy production `jfv-app-api`, then `jfv-app`, then `plants-map-page`.
5. Point the production Page app URL at the new editor.
6. Verify login, reads, one plant action, and one editor write in production.
7. Keep the legacy apps deployed for rollback.

### Rollback

Point the Page app URL back to the legacy `plants-map` deployment. The legacy apps and their Vercel projects remain untouched until the new editor has been stable for an agreed period.

### After cutover

- Remove the legacy Page app definition from the production space.
- Remove the temporary `plants-map-page` Vercel project if the editor is later moved to a Contentful-hosted bundle.
- Archive `treeviewer-api` when `jfv-map` is retired.
- Remove the legacy apps from Vercel once the rollback window has passed.

## Known intentional differences

- Water mode and 3D are not part of the Page editor.
- Permissions are not gated in the editor; all editors are expected to share the same Contentful permissions.
- Zone drawing is not implemented; sectors can be drawn, zones can be moved and edited.
- Measured points and measurements are session-only, matching the legacy editor.
- The `Marked` tag imported from JSON is temporary and is not persisted to Contentful.
