import type { NextConfig } from "next";
import path from "path";

const allowedOrigins = (
  process.env.SERVER_ACTION_ALLOWED_ORIGINS ||
  "localhost:3000,127.0.0.1:3000,tapatcare.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  assetPrefix: "/dashboard-static",
  transpilePackages: [
    "@tapat-care/api-contracts",
    "@tapat-care/design-tokens",
    "@tapat-care/navigation",
    "@tapat-care/ui-primitives",
  ],
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
