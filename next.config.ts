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
        destination: `${process.env.CMS_URL}/wp-json/:path*`,
      },

      // 2. IMÁGENES / MEDIA (IMPORTANTE)
      // Si la base de datos de WP devuelve imágenes con la URL "https://periodiconaranja.es/wp-content/...",
      // la app intentará cargarlas al dominio principal. Next.js debe servir de proxy.
      {
        source: "/wp-content/uploads/:path*",
        destination: `${process.env.CMS_URL}/wp-content/uploads/:path*`,
      },

      // 3. OTRAS RUTAS COMUNES DE WORDPRESS (Por si acaso)
      // A veces los plugins crean rutas en la raíz o carpetas custom.
      {
        source: "/media/:path*",
        destination: `${process.env.CMS_URL}/wp-content/uploads/:path*`,
      },

      // Mantenimiento de assets propios de Next.js (si tenías esta configuración antes)
      { source: "/assets/:path*", destination: "/_next/:path*" },
      {
        // La ruta en tu servidor Next.js que usarás (tú inventas el nombre)
        source: '/api/enviar-wordpress',
        // La URL real de tu webhook de WordPress
        // Nota: Los parámetros de consulta (query params) se pasan automáticamente si no hay conflicto,
        // pero dado que tu URL de destino ya tiene query params críticos (?wpwhpro_action...),
        // es mejor ponerla tal cual.
        destination: `${process.env.CMS_URL}/?wpwhpro_action=main_3354&wpwhpro_api_key=oi2qmtqa50llioaofo2i7kxvx5lsigg2jxlzexjppp3ccrfp41ehpzsoy2xqhjl3`,
      },
      { source: '/graphql/:path*',
        destination: `${process.env.CMS_URL}/graphql/:path*`,
      },
    ];
  },
};

export default nextConfig;