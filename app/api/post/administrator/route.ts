import {NextRequest, NextResponse} from "next/server";

import {createClient} from "@/lib/supabase/server";






export async function GET(req: NextRequest) {
    try{
        const supabase = await createClient();

        const {data, error} = await supabase.from('posts').select('*').order('published_at', { ascending: false });
        if (error) {
            return NextResponse.json({error: error.message}, {status: 400});

        }

        return NextResponse.json(data, {status: 200});
    }catch(e: unknown){
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POST FETCHING API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching post.", details: errorMessage},
            {status: 500}
        );
    }


}