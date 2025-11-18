import type {Post} from "@/Types/Posts";
import Noticia from "@/components/ui/Noticia";
import {method} from "lodash";
import {createClient} from "@/lib/supabase/server";


interface Props{
    params: {
        slug: string;
    }
}

export async function fetchNoticia(slug: string): Promise<Post | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
    if (error) {
        console.error("Error fetching noticia:", error.message);
        return null;
    }
    return data as Post | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const slugPath = await params;
    const noticia = await fetchNoticia(slugPath.slug);
    return {
        title: noticia?.title,
        description: `Posts under the category: ${slugPath}`,
    };



}

export default async function Noticias({ params }: Props) {

    const category = await params;

    const slug = category.slug;



    return (
        <Noticia slug={slug}/>
    );
}