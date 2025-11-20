// eslint-disable @typescript-eslint/no-unused-vars

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type Context = {
    params: Promise<{ user_id: string }>;
};

export async function GET(req: NextRequest, context: Context) {
    const { user_id } = await context.params;
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.from('users').select('*').eq('id', user_id).single();
        if (error) return NextResponse.json({ message: "el usuario no existe" }, { status: 404 });
        return NextResponse.json(data, { status: 200 });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL AUTHORS FETCHING API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during fetching authors.", details: errorMessage },
            { status: 500 }
        );
    }
}