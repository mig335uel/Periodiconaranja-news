/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

type Context = {
    params: Promise<{ slug: string }>;
};


export async function GET(req: NextRequest, context: Context) {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';

    let idData: number;
    try {
        const response = await fetch(`${process.env.CMS_URL}/wp-json/wp/v2/categories?slug=${slug}`);
        const data = await response.json();
        if (response.status !== 200) {
            return NextResponse.json({ error: response.statusText }, { status: response.status });
        }
        if (data.length === 0) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        idData = data[0].id;
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during fetching categories.", details: errorMessage },
            { status: 500 }
        );
    }

    try {
        // Fetch posts for this category from WordPress
        const postsResponse = await fetch(`${process.env.CMS_URL}/wp-json/wp/v2/posts?categories=${idData}&_fields=id,date,slug,title,excerpt,author,featured_media,jetpack_featured_media_url,categories,_links,_embedded&per_page=100&page=${page}`);

        if (!postsResponse.ok) {
            throw new Error(`WordPress API error: ${postsResponse.statusText}`);
        }
        const postsData = await postsResponse.json();

        const categoryIds = Array.from(new Set(postsData.flatMap((p: any) => Array.isArray(p.categories) ? p.categories : []))).filter(Boolean);
        let categories: any[] = [];
        if (categoryIds.length > 0) {
            const categoriesResponse = await fetch(`${process.env.CMS_URL}/wp-json/wp/v2/categories?include=` + categoryIds.join(',') + '&per_page=100');
            if (!categoriesResponse.ok) {
                throw new Error(`WordPress categories API returned ${categoriesResponse.status}`);
            }
            const categoriesJson = await categoriesResponse.json();
            categories = Array.isArray(categoriesJson) ? categoriesJson : [categoriesJson];
        }

        // Collect unique author IDs from posts
        const authorIds = Array.from(new Set(postsData.map((p: any) => p.author).filter(Boolean)));
        let authors: any[] = [];
        if (authorIds.length > 0) {
            const authorsResponse = await fetch(`${process.env.CMS_URL}/wp-json/wp/v2/users?include=` + authorIds.join(','));
            if (!authorsResponse.ok) {
                throw new Error(`WordPress authors API returned ${authorsResponse.status}`);
            }
            const authorsJson = await authorsResponse.json();
            authors = Array.isArray(authorsJson) ? authorsJson : [authorsJson];
        }

        // Map embedded data to match Post interface
        const mappedPosts = postsData.map((post: any) => ({
            ...post,
            author: authors.find((a: any) => a.id === post.author) || null,
            categories: Array.isArray(post.categories) ? categories.filter((c: any) => post.categories.includes(c.id)) : [],
            // Ensure jetpack_featured_media_url fallback if needed, or rely on it being present
        }));





        return NextResponse.json({ posts: mappedPosts }, { status: 200 });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POSTS FETCHING API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during fetching posts.", details: errorMessage },
            { status: 500 }
        );

    }
}