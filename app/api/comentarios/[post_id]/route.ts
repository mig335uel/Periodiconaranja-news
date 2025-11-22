// eslint-disable @typescript-eslint/no-unused-vars

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


type Context = {
    params: Promise<{ post_id: string }>;
};

export async function GET(req: NextRequest, context: Context) {
    const { post_id } = await context.params;


    try {
        const supabase = await createClient();

        const { data, error } = await supabase.from('comments').select('*, user:users(name, last_name)').eq('post_id', post_id).eq('status', 'approved');
        if (error) {
            NextResponse.json({ error }, { status: 400 });
        }
        return NextResponse.json(data, { status: 200 });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during fetching categories.", details: errorMessage },
            { status: 500 }
        );
    }

}




export async function DELETE(req: NextRequest, context: Context) {
    const { post_id } = await context.params;


    try {
        const supabase = await createClient();
        const { error } = await supabase.from('comments').delete().eq('id', post_id);
        if(error) return NextResponse.json({error: error}, {status: 400});
        return NextResponse.json({ message: "tu comentario ha sido borrado con éxito" }, { status: 200 });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during fetching categories.", details: errorMessage },
            { status: 500 }
        );
    }
}