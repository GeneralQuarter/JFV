# jfv-app-api

Write-only API and Contentful OAuth broker for `jfv-app`.

Planned endpoints:

- `GET /api/auth/login`
- `GET /api/auth/callback`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/plants/:id/plant`
- `POST /api/plants/:id/dead`
- `GET /api/health`

The API uses the logged-in user's Contentful OAuth token for writes. It does not expose a generic CMA proxy and does not provide content read endpoints.

See the root README and the monorepo plan for environment variables and deployment details.
