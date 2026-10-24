# HCM Lite Frontend

React 19 application built with Vite. The interface talks to the separately deployed HCM Lite Express API and uses its credentialed session cookie.

## Local development

Requires Node.js 22.12 or later. With the backend running on port 8000 (as set in its `.env.example`), install dependencies and start Vite:

```sh
npm install
npm run dev
```

By default the frontend calls `/api`, which Vite proxies to `http://127.0.0.1:8000`. Leave `VITE_API_URL` empty to use this local proxy. To call a different API locally, set `VITE_API_URL` to the backend origin or API base URL; the client adds `/api` exactly once.

## Vercel deployment

The existing frontend is `https://hcm-client-seven.vercel.app`, connected to `MuzamilKhan197/hcm-client`. Use the repository root, the Vite preset, `npm run build` as the build command, and `dist` as the output directory.

The production client always uses the same-origin `/api` URL. `vercel.json` forwards it to `https://hcm-api.vercel.app/api/:path*` **before** the SPA history-route fallback. This keeps sign-in cookies on the frontend origin. A stale `VITE_API_URL` value in Vercel cannot override this production proxy; that variable is only used during development.

No frontend environment variable is required for production. The backend must have `CLIENT_URL=https://hcm-client-seven.vercel.app`. Keep `MONGODB_URI`, `JWT_SECRET`, and any AI key exclusively in the backend project.

Push the updated frontend and redeploy the **latest commit**. The previously deployed bundle used `https://hcm-api.vercel.app/` directly, so it requested `/auth/status` without the canonical `/api` prefix. A source change does not update that old bundle until it is rebuilt and deployed.

Verify `https://hcm-client-seven.vercel.app/api/auth/status` returns JSON (not `index.html`). If it returns 500/503, check the backend health endpoint and runtime logs. If the backend domain changes, update the proxy destination in `vercel.json` and redeploy the frontend. Preview deployments need a matching trusted backend origin and an intentionally selected database; the production backend does not accept arbitrary preview origins.

After deployment, open the frontend, create the company and first administrator, and verify sign-in, sign-out, and a role-restricted page. The Vite production build can be checked locally with `npm run build`.
