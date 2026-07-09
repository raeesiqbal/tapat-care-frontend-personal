# Dashboard Zone

This is the dedicated dashboard zone (`/dashboard/*`) for careseekers, caregivers, and superadmins.

## Run

```bash
npm install
npm run dev
```

Runs on `http://localhost:3001`.

## Multi-zone notes

- `assetPrefix` is `/dashboard-static` to avoid asset conflicts with the user-facing zone.
- Dashboard redirects to public routes such as `/login` and `/verify-email` use `PUBLIC_APP_ORIGIN` or `NEXT_PUBLIC_PUBLIC_APP_ORIGIN`. Local fallback is `http://localhost:3000`; production fallback is `https://tapatcare.com`.
- The user-facing app proxies:
  - `/dashboard`
  - `/dashboard/:path+`
  - `/dashboard-static/:path+`
