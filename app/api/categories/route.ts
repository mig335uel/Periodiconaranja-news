import { NextRequest, NextResponse } from 'next/server';
import {createClient} from "@/lib/supabase/server";



export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();

        const {data, error} = await supabase.from('categories').select('*');

        if (error) {
            return NextResponse.json({error: error.message}, {status: 400});
        }

        return NextResponse.json({categories: data}, {status: 200});
    }catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );

    }

}