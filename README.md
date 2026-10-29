# JFV Monorepo

Monorepo for the JFV plantation applications.

## Apps

| App | Purpose | Deployment |
| --- | --- | --- |
| `apps/jfv-app` | React PWA viewer | Vercel |
| `apps/jfv-app-api` | Write-only API and Contentful OAuth broker | Vercel |
| `apps/plants-map-page` | Contentful page editor | Contentful-hosted bundle |
| `apps/sidebar-plants` | Contentful sidebar micro app | Contentful-hosted bundle |
| `apps/field-editor-full-latin-name` | Contentful field editor | Contentful-hosted bundle |
| `apps/field-editor-plant-code` | Contentful field editor | Contentful-hosted bundle |

Legacy apps (`jfv-map`, `plants-map`, `treeviewer-api`) remain in their original repositories until cutover.

## Packages

| Package | Purpose |
| --- | --- |
| `packages/core` | Canonical domain models, Contentful entry types/converters, tag constants, and shared domain rules |
| `packages/map-data` | Canonical static GeoJSON, map defaults, layer IDs, and map style factory |
| `packages/contentful-app` | Contentful app shell, location routing, provider mounting, auto-resizer, and plant-code generation |

Workspace packages are source-only TypeScript consumed directly by Vite; they do not need a separate build step.

## Requirements

- Node.js 22 (see `.nvmrc`)
- pnpm 12 (see `packageManager` in `package.json`)

## Setup

```bash
pnpm install
```

Copy the relevant `.env.example` to `.env.local` in each app and fill in local values.

For local HTTPS development on `https://jfv.local`, see [`dev/README.md`](dev/README.md).

## Commands

```bash
pnpm dev:jfv-app    # jfv-app dev server
pnpm dev:page       # plants-map-page dev server (http://localhost:3002)
pnpm dev:api        # jfv-app-api local dev
pnpm typecheck      # typecheck every workspace
pnpm lint           # lint with Biome
pnpm format         # format with Biome
pnpm test           # run available tests
pnpm build          # build every app
```

Run a single app's build with pnpm filtering, for example:

```bash
pnpm --filter jfv-app build
pnpm --filter plants-map-page build
```

## Deployment

Deployment and cutover are documented in [`docs/deployment.md`](docs/deployment.md), including:

- Vercel project settings and `vercel.json` files
- environment variables for `jfv-app` and `jfv-app-api`
- PWA/service-worker cache headers
- Contentful app definitions and micro-app bundle uploads
- staging validation, cutover, and rollback steps

The short version: `jfv-app` and `jfv-app-api` are separate Vercel projects with **Root Directory** set to their app folder and **Include source files outside of the Root Directory** enabled. The Page editor and the three Contentful micro apps are uploaded as Contentful-hosted bundles:

```bash
pnpm --filter plants-map-page build
pnpm --filter plants-map-page upload:ci

pnpm --filter sidebar-plants build
pnpm --filter sidebar-plants upload:ci
```
