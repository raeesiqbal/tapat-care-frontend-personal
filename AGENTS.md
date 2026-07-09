<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`.
Your training data is outdated. The bundled Next.js docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Project coding rules
- Check `package.json` before changes. Write code compatible with installed versions only.
- Use App Router only (`src/app` and `dashboard/src/app`).
- Do not create `/pages`.
- Before editing code, state which local Next.js doc file(s) you checked.

## Server vs Client Components
- Server Components are default. Keep pages/layouts server-first.
- Use Client Components only for browser-only interactivity (`useState`, `useEffect`, event handlers, `window`, `navigator`).
- Do not mark a component with `"use client"` if it is static/presentational only.
- Keep data fetching in Server Components or server-only libraries.
- Do not use `useEffect` for normal initial data loading.

## Fetching data
- For authenticated dashboard data, fetch on the server and read auth from cookies.
- Prefer central server-only fetch helpers (like `dashboard/src/lib/*`) over duplicate fetch logic in pages.
- Use `cache: "no-store"` for user-specific or highly dynamic data (profile, dashboard snapshots, conversations/messages).

## Mutating data
- Prefer Server Actions for writes from forms/buttons.
- Call Django REST endpoints from Server Actions; keep tokens/secrets on server side.
- Use Route Handlers only when an actual HTTP endpoint is needed (webhooks, third-party callbacks, proxy needs).

## Caching and revalidation
- Cache public/slow-changing data (for example service/category lists) with cache tags.
- Revalidate after mutations using `revalidatePath` or `revalidateTag`.
- Do not cache private user-scoped responses.
- For messaging flows, revalidate conversation/message views after send, mark-read, archive, restore, or delete-for-me actions.

## Error handling
- Model expected errors as return values from Server Actions and show them in UI.
- Throw only for unexpected failures; handle with segment `error.tsx`.
- Add `loading.tsx` where async routes need a loading boundary.
- Add `not-found.tsx` and use `notFound()` for missing resource pages.

## Backend integration notes
- Current backend routes are mounted from `tapat-care-backend/tapat_care/urls.py`.
- Do not assume marketplace endpoints are available unless they are mounted there.


## Frontend Architecture

Before making frontend architecture, routing, styling, onboarding, dashboard, or shared package changes, read:

- `docs/frontend-architecture.md`

Follow that document as the source of truth unless the user explicitly updates the architecture.


## Infrastructure-aware feature work

When creating a new feature, use judgment to decide whether infrastructure context is needed. If the feature may touch routing, middleware, rewrites, redirects, multi-zone behavior, environment variables, auth/session cookies, backend endpoints, shared packages, build scripts, static assets, or external services, read:

- `docs/infrastructure-feature-build.md`

Skip this file for small visual, copy, or isolated component changes where infrastructure is clearly not involved.


## Running cmd commands

If you want to run any command, please ask first or give me commands to run at the end of converstaion of i will pass you results
