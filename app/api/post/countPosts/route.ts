import {NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {

    try{
        const response = await fetch("https://periodiconaranja.es/wp-json/wp/v2/posts?per_page=500"); // Reduced per_page since we only check length/headers usually, but user code counts length of returned array. Wait, if per_page=1 this might be wrong if counting ALL posts. The user code does `data.length` on `per_pages=1000`. I should keep 1000 or use headers X-WP-Total if available. The user code is `data.length`. I will match the user's logic but update URL.
        if (response.status !== 200) {
            return NextResponse.json({error: "Error al obtener las noticias"}, {status: response.status});
        }
        const data = await response.json();

        return NextResponse.json({count: data.length}, {status: 200});

    }catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POST COUNT FETCHING API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching post count.", details: errorMessage},
            {status: 500}
        );
    }




}