import {NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {

    try{
        const supabase = await createClient();
        const {data, error} = await supabase.from('posts').select('id') ;
        if (error) {
            return NextResponse.json({error: error.message}, {status: 400});
        }

        if (!data) {
            return NextResponse.json({count: 0}, {status: 200});
        }

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