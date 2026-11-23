# VoteInfo Nepal – Election Information Portal

## What was inspected

The supplied repository was a fresh React/TanStack Start application using Vite and Tailwind. It did **not** contain Express, MongoDB/Mongoose, AWS deployment files, a deployed API URL, or database credentials. No AWS settings or infrastructure have been changed, and nothing has been deployed.

The hosted framework is retained rather than replacing it with an unsupported MERN runtime. This application can consume your existing Express/MongoDB REST API without moving or modifying that backend.

## Run locally

```sh
bun install
bun run dev
# alternatively: npm install && npm run dev
```

Open the URL printed by Vite. Production build: `bun run build`. Tests: `bun run test`. Production builds are checked automatically in the Lovable environment; do not launch a separate build there.

## Connect the existing backend

Set the **public backend origin** (not an endpoint and not a secret) before starting/building the frontend:

```env
VITE_API_URL=https://your-existing-backend.example
```

Do not include `/api/candidates` in this value. The application adds `/api/candidates` itself. No `.env` file has been created or overwritten. Never put a database password, MongoDB URI, AWS credential, or private API token in a `VITE_` variable.

Without `VITE_API_URL`, the portal uses six **fictional** sample candidates and generated sample portraits. Add/edit/delete operations work across pages within the current session, but reset on refresh. This is not persistent MongoDB storage. With a URL configured, list/create/update/delete use the real API and failures are shown rather than silently switching to sample data.

Expected candidate shape:

```json
{
  "_id": "mongodb-object-id",
  "name": "Candidate name",
  "party": "Party name",
  "constituency": "Kathmandu - 1",
  "symbol": "Tree",
  "description": "At least ten characters of description.",
  "image": "https://your-image-host.example/portrait.jpg",
  "createdAt": "2026-11-01T00:00:00.000Z",
  "updatedAt": "2026-11-01T00:00:00.000Z"
}
```

An `id` field is also accepted. Empty images display initials. Lists may be arrays, `{ "data": [...] }`, or `{ "candidates": [...] }`. Create/update responses must return the saved candidate, directly or in `data`. Error responses should include `{ "message": "..." }`. Remote `isSample: true` is honored; real candidate data should not be mislabeled as sample.

## API contract for your existing backend

| Method | Endpoint | Expected behavior |
|---|---|---|
| GET | `/api/candidates` | 200, candidate array |
| GET | `/api/candidates/:id` | 200, candidate; 404 when missing |
| POST | `/api/candidates` | 201, saved candidate |
| PUT | `/api/candidates/:id` | 200, updated candidate |
| DELETE | `/api/candidates/:id` | 200 JSON or 204 |
| GET | `/api/health` | 200, service health |

The directory and profiles currently share the list query. No new backend endpoints were deployed. The existing backend must validate inputs, apply write authorization, enforce CORS, handle MongoDB errors, and return proper status codes. Public demo administration is **not** a secure production admin system; do not connect unrestricted production writes to a public dashboard. This project does not introduce authentication, as requested.

## AWS handoff (no deployment performed)

1. Supply the existing HTTPS backend origin and verify its health endpoint.
2. Add that origin as `VITE_API_URL` to your existing frontend build environment. Rebuild when changing the value.
3. Keep `MONGODB_URI`, server port, and AWS secrets in the existing backend's private environment only. Their current values are unknown and have not been changed.
4. On the existing backend, allow your actual frontend origin in CORS; use HTTPS. Retain existing validation, access control, security groups, IAM, DNS, and MongoDB settings.
5. **Only after your approval**, deploy using your existing supported TanStack Start hosting pipeline. This is not a plain static React SPA: do not upload only a client folder to S3 and assume SSR works. If your current frontend is static-only, a hosting compatibility decision is required before deployment.
6. Verify list, detail, add, edit, delete, and refresh persistence against a test dataset before production use.

## Main modified files

- `src/styles.css`: semantic colors, typography, layouts, responsive design.
- `src/routes/__root.tsx`: fonts, shared metadata, notifications.
- `src/routes/index.tsx`: homepage.
- `src/routes/candidates.index.tsx`, `src/routes/candidates.$id.tsx`: directory and profiles.
- `src/routes/admin.tsx`: add/edit/delete dashboard.
- `src/routes/announcements.tsx`, `src/routes/about.tsx`: notices and portal information.
- `src/components/portal-shell.tsx`, `candidate-directory.tsx`, `candidate-editor.tsx`, `announcement-list.tsx`: reusable views and controls.
- `src/lib/candidates.ts`, `announcements.ts`: validation, API contract, and labeled sample data.
- `src/components/ui/button.tsx`, `dialog.tsx`: design-system variants.
- `src/assets/*.asset.json`: hosted images, without repository image binaries.
- `src/test/candidates.test.ts`: candidate validation/filter/API tests.
- `AGENTS.md`, `roadmap.md`, `README.md`: architecture, task status, and delivery guidance.

## Unfinished / unavailable

Real AWS/MongoDB connectivity and persistent CRUD testing require the deployed backend URL. No Express/Mongoose source was supplied, so backend syntax, schema, CORS, authorization, health, and status codes cannot be inspected or certified. AWS deployment is intentionally unperformed. Announcements are clearly labeled static sample notices, not official election announcements.
