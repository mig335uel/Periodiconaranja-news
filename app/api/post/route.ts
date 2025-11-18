import {NextRequest, NextResponse} from "next/server";

import {createClient} from "@/lib/supabase/server";


import type {Post} from "@/Types/Posts";



export async function GET(req: NextRequest) {
    try{
        const supabase = await createClient();

        const {data, error} = await supabase.from('posts').select('*').eq('is_published', true) as {data: Post[] | null, error: Error | null};
        if (error) {
            return NextResponse.json({error: error.message}, {status: 400});

        }

        return NextResponse.json({post: data}, {status: 200});
    }catch(e: unknown){
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POST FETCHING API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching post.", details: errorMessage},
            {status: 500}
        );
    }


}

interface PostsData {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    categoryIds?: string[];
    authorId: string;
    featuredImage?: string | null;
    isPublished?: true;
}

export async function POST(req: NextRequest) {
    const postsData: PostsData = await req.json();
    try{
        const supabase = await createClient();

        const {data: dauth, error: eauth} = await supabase.auth.getUser();
        if (eauth) {
            return NextResponse.json({error: eauth.message}, {status: 400});
        }
        const user = dauth.user;
        if (!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        postsData.authorId = user.id;
        const { title, slug, content, excerpt, categoryIds, authorId, featuredImage, isPublished = true } = postsData;
        const {data, error} = await supabase.from('posts').insert([{
            title,
            slug,
            content,
            excerpt,
            author_id: authorId,
            featured_image: featuredImage,
            is_published: true,
            published_at: isPublished ? new Date().toISOString() : null
        }]).select('*').single() as {data: Post | null, error: Error | null};
        if (error) {
            return NextResponse.json({error: error.message}, {status: 400});

        }

        const {data: postCategoryData, error: postCategoryError} = await supabase.from('post_categories').insert(
            categoryIds?.map((categoryId) => ({
                post_id: data?.id,
                category_id: categoryId
            }))
        );
        if (postCategoryError) {
            return NextResponse.json({error: postCategoryError.message}, {status: 400});
        }
        
        return NextResponse.json({post: data}, {status: 201});
    }catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POST CREATING API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during creating post.", details: errorMessage},
            {status: 500}
        );
    }
}


