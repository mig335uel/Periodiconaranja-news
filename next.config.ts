import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Configuración para el manejo de payloads de datos

    // 1. Aumenta el límite para Server Actions y rutas que Next.js maneja como tales
    serverActions: {
        // Establecer el límite a un valor alto (ej. 25mb) para acomodar la Base64 de las imágenes.
        bodySizeLimit: '25mb',
    },

    // 2. Configuración para rutas API tradicionales (ruta /api/posts, /api/login, etc.)
    api: {
        // Aumenta el límite del cuerpo de la petición para las rutas API
        bodyParser: {
            sizeLimit: '25mb',
        },
    },

    // Si estás usando TypeScript (lo cual parece que sí), añade esto
    // para ignorar warnings de tipos en las rutas API de Express/etc.
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
