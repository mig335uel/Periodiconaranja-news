import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";


type Context = {
    params: Promise<{ slug: string }>;
};


export async function GET(req: NextRequest,context: Context) {
    const { slug } = await context.params;

    const supabase = await createClient();
    let idData: string;
    try{
        const { data, error } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', slug)
            .single();
        if (error) {
            return NextResponse.json({ error: error.message },{status: 500});
        }
        idData = data.id;
    }catch (e: unknown){
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );
    }try{
        const { data, error } = await supabase
            .from('posts')
            .select('*, post_categories!inner(*)')
            .eq('post_categories.category_id', idData);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ posts: data }, { status: 200 });
    }catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POSTS FETCHING API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching posts.", details: errorMessage},
            {status: 500}
        );

    }
}