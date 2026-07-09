const dashboardZoneOrigin =
  process.env.DASHBOARD_ZONE_ORIGIN || 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@tapat-care/api-contracts',
    '@tapat-care/design-tokens',
    '@tapat-care/navigation',
    '@tapat-care/ui-primitives',
  ],
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [75, 85, 90],
  },
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: `${dashboardZoneOrigin}/dashboard`,
      },
      {
        source: '/dashboard/:path+',
        destination: `${dashboardZoneOrigin}/dashboard/:path+`,
      },
      {
        source: '/dashboard-static/:path+',
        destination: `${dashboardZoneOrigin}/dashboard-static/:path+`,
      },
    ];
  },
};

module.exports = nextConfig; 
