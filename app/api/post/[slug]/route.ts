import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {Post, Category} from "@/Types/Posts";






export async function GET(req: NextRequest, {params}:{params: any }) {
    const parametro = await params;
    const slug = parametro.slug as string;
    let post: Post;
    const supabase = await createClient();
    try{
        const {data:postData, error: postError} = await supabase.from('posts').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
        if (postError) {
            return NextResponse.json({error: postError.message}, {status: 400});
        }
        post = postData as Post;
        const {data: authorData, error: authorError} = await supabase.from('users').select('*').eq('id', post.author_id).maybeSingle();
        if (authorError) {
            return NextResponse.json({error: authorError.message}, {status: 400});
        }
        post.author = authorData;

        const { data: postCategories, error: categoriesError } = await supabase
            .from('post_categories')
            .select(`
                category_id,
                categories (
                    id,
                    name,
                    slug,
                    parent_id,
                    created_at,
                    updated_at
                )
            `)
            .eq('post_id', post.id);

        if (categoriesError) {
            return NextResponse.json({ error: categoriesError.message }, { status: 400 });
        }

        post.categories = postCategories?.map((pc) => pc.categories) as unknown as Category[] || [];

        return NextResponse.json({post: post}, {status: 200});

    }catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POST FETCHING API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching post.", details: errorMessage},
            {status: 500}
        );

    }

}