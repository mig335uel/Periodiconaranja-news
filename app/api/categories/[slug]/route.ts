import {NextRequest, NextResponse} from "next/server";

type Context = {
    params: Promise<{ slug: string }>;
};


export async function GET(req: NextRequest,context: Context) {
    const { slug } = await context.params;

    let idData: number;
    try{
        const response = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/categories?slug=${slug}`);
        const data = await response.json();
        if (response.status !== 200) {
            return NextResponse.json({ error: response.statusText },{status: response.status});
        }
        if (data.length === 0) {
             return NextResponse.json({ error: "Category not found" },{status: 404});
        }
        idData = data[0].id;
    }catch (e: unknown){
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );
    }
    
    try{
        // Fetch posts for this category from WordPress
        const postsResponse = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/posts?categories=${idData}&_fields=id,date,slug,title,excerpt,author,featured_media,jetpack_featured_media_url,categories,_links,_embedded`);
        
        if (!postsResponse.ok) {
             throw new Error(`WordPress API error: ${postsResponse.statusText}`);
        }

        const postsData = await postsResponse.json();
        
        // Map embedded data
        const mappedPosts = postsData.map((post: any) => ({
            ...post,
            author: post._embedded?.author?.[0] || post.author,
            categories: post._embedded?.['wp:term']?.[0]?.flat() || [], 
            // tags usually at [1]
        }));

        return NextResponse.json({ posts: mappedPosts }, { status: 200 });
    }catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POSTS FETCHING API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching posts.", details: errorMessage},
            {status: 500}
        );

    }
}