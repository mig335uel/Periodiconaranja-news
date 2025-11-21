// eslint-disable @typescript-eslint/no-unused-vars
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";




export async function GET(req: NextRequest){
    try{
        const supabase = await createClient();


        const {data, error} = await supabase.from('comments').select('*');
        if(error){
            return NextResponse.json({count: 0}, {status: 200});
        }
        return NextResponse.json({count: data.length}, {status: 200});
    }catch(e: unknown){
       const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );
    }
}