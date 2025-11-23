import { NextRequest, NextResponse } from 'next/server';
import {createClient} from "@/lib/supabase/server";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

interface Category {
    name: string;
    slug: string;
    parent_id: string | null;
}

export async function POST(req:NextRequest) {
    const {name, slug, parent_id} = await req.json();

    const newCategory: Category = {
        name: name,
        slug: slug,
        parent_id: parent_id
    }
    

    try {
        const supabase = await createClient();

        const {data, error} = await supabase.from('categories').insert(newCategory);

        if(error){
            return NextResponse.json({message: error}, {status: 400});

        }

        return NextResponse.json(data,{status: 200});
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );
    }
    
}