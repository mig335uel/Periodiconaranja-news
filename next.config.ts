import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  assetPrefix: "/assets",
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },

  // Quita source maps del navegador (MUY importante)
  productionBrowserSourceMaps: false,

  // Reduce trazas internas
  reactStrictMode: true,

  // Headers de seguridad (mitigación real)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/assets/:path*",
        destination: "/_next/:path*",
      },
      {
        source: "/assets/_next/:path*",
        destination: "/_next/:path*",
      },
      {
        source: "/assets/:path*",
        destination: "/_next/:path*",
      },

      // 2. NUEVA REGLA: TÚNEL DE IMÁGENES
      // Cuando pidan /media/..., Next.js buscará en /wp-content/uploads/... de WordPress
      {
        source: "/media/:path*",
        destination: `https://periodiconaranja.es/wp-content/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
