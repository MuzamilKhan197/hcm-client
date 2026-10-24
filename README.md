# HCM Lite Frontend

React 19 application built with Vite. The interface talks to the separately deployed HCM Lite Express API and uses its credentialed session cookie.

## Local development

Requires Node.js 22.12 or later. With the backend running on port 4000, install dependencies and start Vite:

```sh
npm install
npm run dev
```

By default the frontend calls `/api`, which Vite proxies to `http://127.0.0.1:4000`. To call a different API locally, copy `.env.example` to `.env.local` and set `VITE_API_URL` to the API base URL ending in `/api`.

## Vercel deployment

Import the `hcm-lite-frontend` GitHub repository as a new Vercel project named `hcm-lite-web`. Use the repository root, the Vite preset, `npm run build` as the build command, and `dist` as the output directory. The included `vercel.json` provides SPA history-route fallback.

Set this environment variable for the Vercel Production environment before building:

| Name | Value |
| --- | --- |
| `VITE_API_URL` | `https://<backend-domain>/api` |

`VITE_API_URL` is public configuration, not a secret. Never add database credentials or `JWT_SECRET` to the frontend project. Configure the backend's `CLIENT_URL` to the exact frontend HTTPS origin. Use frontend and API domains under the same registrable domain so browsers send the `SameSite=Strict` session cookie.

After deployment, open the frontend, create the company and first administrator, and verify sign-in, sign-out, and a role-restricted page. The Vite production build can be checked locally with `npm run build`.
