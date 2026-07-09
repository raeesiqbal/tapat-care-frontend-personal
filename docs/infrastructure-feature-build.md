# Infrastructure Considerations For New Features

Read this file when a new feature may affect application infrastructure, deployment boundaries, runtime configuration, or backend integration. If the feature is only a small visual or copy change, you can skip this file.

## When To Read This

Use judgment, but prefer reading this document before work that touches:

- Next.js routing, middleware, rewrites, redirects, or multi-zone behavior.
- The root app, the dashboard app, or shared workspace packages.
- Environment variables, backend base URLs, OAuth credentials, cookies, or session behavior.
- Server Actions, Route Handlers, backend endpoint contracts, or API error handling.
- Build scripts, lint scripts, package dependencies, shared TypeScript paths, or transpiled packages.
- Static assets, asset prefixes, image domains, or cross-zone navigation.
- External services such as payments, screening, email verification, or auth providers.

## Build Context

This repository is a Next.js multi-zone setup:

- The root app owns public pages, login, verification, and onboarding entry points.
- The dashboard app owns `/dashboard`, `/dashboard/*`, and dashboard static assets.
- Shared packages live under `packages/*` and must be compatible with both apps when imported by both.
- Cross-zone navigation and redirects must be checked against the zone that actually owns the target route.

## Feature Checklist

Before creating or changing a feature with infrastructure impact:

- Identify which app owns the route and where the user should land after redirects.
- Confirm whether the feature needs root app code, dashboard app code, shared package code, backend code, or more than one of those.
- Check whether middleware, rewrites, `assetPrefix`, cookies, or environment variables affect the user flow.
- Keep backend calls in server-only helpers or Server Actions when secrets or auth tokens are involved.
- Do not assume a backend route exists unless it is mounted and stable.
- Keep feature-specific UI in the owning app. Share only primitives, tokens, types, and stable contracts through packages.
- Update both build surfaces when shared contracts change: the root app and the dashboard app.

## Verification

For infrastructure-sensitive features, run or request the checks that match the touched surface:

- Root app: `npm run build` and `npm run lint`.
- Dashboard app: `npm run build:dashboard` and `npm run lint:dashboard`.
- Shared packages or cross-zone flows: run both root and dashboard checks.
- Routing changes: manually verify the source route, destination route, auth state, and browser-visible URL.
