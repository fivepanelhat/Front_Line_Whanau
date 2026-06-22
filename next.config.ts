import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',           // Required for Tauri
  distDir: 'out',             // Tauri will use this folder
  images: {
    unoptimized: true,
  },
  trailingSlash: true,        // Recommended for static export
};

export default nextConfig;
