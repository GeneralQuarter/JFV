# Plants Map Page

Contentful Page app rewrite of the plantation editor.

## Local development

Start the Vite server:

```bash
pnpm dev:page
```

It serves on:

```text
http://localhost:3002
```

Port 3002 is used because the local `jfv-app-api` runs on 3000 and `jfv-app` runs on 3001.

In Contentful, open the app definition for this Page app and set the **Page** location URL to:

```text
http://localhost:3002
```

Reload the Contentful page. The app will load entries through `sdk.cma` and show a loading overlay while fetching.

If Contentful/browser mixed-content rules block the HTTP iframe, use an HTTPS tunnel:

```bash
ngrok http 3002
```

and set the Page URL to the HTTPS tunnel URL.

`contentful-app-scripts start` is also available if you prefer its tunnel/app-definition workflow:

```bash
pnpm --filter plants-map-page exec contentful-app-scripts start
```

## Notes

- Quick actions (Pin/Plant/Dead) mutate real Contentful data.
- `VITE_*` runtime variables are not needed by this app; Contentful supplies the space, environment, and CMA client.
- Build output goes to `build/`.
