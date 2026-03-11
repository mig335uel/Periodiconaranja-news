import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // 1. OBTENER COOKIES DE FORMA RÁPIDA (No gasta CPU casi)
    const allCookies = request.cookies.getAll();
    
    // 2. BUSCAR SI EXISTE ALGUNA COOKIE DE SUPABASE
    // Supabase suele usar nombres que contienen 'sb-' o 'supabase-auth'
    const hasAuthCookie = allCookies.some(cookie => 
        cookie.name.includes('sb-') || cookie.name.includes('auth')
    );

    // 3. LÓGICA DE FILTRADO
    // Si la ruta NO es de administración y NO hay cookie de sesión...
    // ...devolvemos la respuesta inmediatamente sin ejecutar updateSession.
    const isAdminRoute = request.nextUrl.pathname.startsWith('/adminPanel');
    const isAccountRoute = request.nextUrl.pathname.startsWith('/myAccount');

    if (!isAdminRoute && !isAccountRoute && !hasAuthCookie) {
        // Es un lector anónimo en una noticia o portada: GASTO CPU = 0
        return NextResponse.next();
    }

    // Solo si es admin, cuenta propia o hay una cookie sospechosa, trabajamos.
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Mantenemos tu matcher para excluir archivos estáticos,
         * pero el código de arriba filtrará las 350k visitas a noticias.
         */
        "/((?!_next/static|_next/image|favicon.ico|auth/login|api/register|api/login|api/upload|login|register|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};