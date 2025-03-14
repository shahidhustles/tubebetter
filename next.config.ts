import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '"i.ytimg.com"',
        port: '',
        search: '',
      },
      {
        protocol: 'https',
        hostname: '"yt3.ggpht.com"',
        port: '',
        search: '',
      },
    ],
  },
};

export default nextConfig;
