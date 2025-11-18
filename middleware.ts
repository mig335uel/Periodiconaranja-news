import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  //se aceptan todas las peticiones para no provocar el mal funcionamiento de la app
    await updateSession(request);
    return;
}

export const config = {
    matcher: [
        /*
         * Excluye:
         * - Next.js internos (_next/static, _next/image, favicon.ico)
         * - Archivos estáticos de la aplicación (svg, png, etc.)
         * - RUTAS DE AUTENTICACIÓN (login, register, auth/login)
         * - ENDPOINTS API PÚBLICOS (api/register, api/login, api/upload)
         */
        "/((?!_next/static|_next/image|favicon.ico|auth/login|api/register|api/login|api/upload|login|register|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};