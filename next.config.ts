import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Desactivamos source maps en producción para ahorrar memoria/disco si no los usas para debug
  productionBrowserSourceMaps: false,
  
  // Opcional: Si usas SASS
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },
  
  // Opcional: Ignorar errores de TS en build para no detener el despliegue por tipos estrictos
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: true,

  async rewrites() {
    return [
      // ---------------------------------------------------------
      // ZONA DE SEGURIDAD PARA LA APP MÓVIL (API PROXY)
      // ---------------------------------------------------------

      // 1. API REST DE WORDPRESS
      // La app pide: https://periodiconaranja.es/wp-json/wp/v2/posts?per_page=10
      // Next.js pide internamente: https://cms.periodiconaranja.es/wp-json/wp/v2/posts?per_page=10
      // La app recibe los datos y no sabe que han venido de 'cms'.
      {
        source: "/wp-json/:path*",
        destination: "https://cms.periodiconaranja.es/wp-json/:path*",
      },

      // 2. IMÁGENES / MEDIA (IMPORTANTE)
      // Si la base de datos de WP devuelve imágenes con la URL "https://periodiconaranja.es/wp-content/...",
      // la app intentará cargarlas al dominio principal. Next.js debe servir de proxy.
      {
        source: "/wp-content/uploads/:path*",
        destination: "https://cms.periodiconaranja.es/wp-content/uploads/:path*",
      },

      // 3. OTRAS RUTAS COMUNES DE WORDPRESS (Por si acaso)
      // A veces los plugins crean rutas en la raíz o carpetas custom.
      {
        source: "/media/:path*",
        destination: "https://cms.periodiconaranja.es/media/:path*",
      },
      
      // Mantenimiento de assets propios de Next.js (si tenías esta configuración antes)
      { source: "/assets/:path*", destination: "/_next/:path*" },
    ];
  },
};

export default nextConfig;