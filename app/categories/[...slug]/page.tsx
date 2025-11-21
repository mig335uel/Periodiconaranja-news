
import NoticiasPorCategoria from "@/components/ui/NoticiasPorCategoria";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/Types/Posts";
import { create } from "lodash";
import { Metadata } from "next";

interface Props {
    params: {
        slug: string[]
    }
}



export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
    const slugPath = await params;

    return {
        title: slugPath.slug.join('/'),
        description: `Posts under the category: ${slugPath}`,
    };



}



export default async function Categories({ params }: Props) {

    const category = await params;

    const slug = category.slug.join('/');
    const supabase = await createClient();
    let posts: Post[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(`/api/categories/${slug}`);
    if(response.ok){
        const data = await response.json();
        posts = data.posts;
    }
    return (
        <NoticiasPorCategoria postsparams={posts} />
    );
}