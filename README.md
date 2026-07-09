This is a [Next.js](https://nextjs.org) App Router multi-zone setup.

## Getting Started

Run the user-facing app:

```bash
npm run dev
```

Run the dashboard zone app in a second terminal:

```bash
npm run dev:dashboard
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/dashboard`.

## Multi-Zone Routing

- User-facing app serves `/*` and proxies dashboard paths with rewrites.
- Dashboard zone serves `/dashboard/*`.
- Dashboard static assets are served under `/dashboard-static/*` via `assetPrefix`.

Configure the user-facing zone target in `.env`:

```bash
DASHBOARD_ZONE_ORIGIN=http://localhost:3001
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
