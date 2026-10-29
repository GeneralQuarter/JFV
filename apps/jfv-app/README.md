# Jardin Forestier des Vallées - App

React PWA viewer for the JFV plantation.

## Access model

- The app is view-only by default and can be shared publicly.
- Users with a Contentful account can log in with Contentful to unlock plant/dead actions.
- Writes go through `jfv-app-api` using the logged-in user's Contentful token.
- No shared password is stored or used.

## Local development

The app runs on port 3001 and expects `jfv-app-api` on port 3000 by default.

```bash
pnpm dev:jfv-app
pnpm dev:api
```

Set `VITE_API_BASE_URL` if the API runs elsewhere.
