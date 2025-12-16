/* eslint-disable @typescript-eslint/no-unused-vars */

import Noticia from "@/components/ui/Noticia";
import NoticiasPorCategoria from "@/components/ui/NoticiasPorCategoria";
import { Post } from "@/Types/Posts";




interface Props {
    params: {
        categories: string[],
        slug?: string
    }
}



export async function generateMetadata({ params }: { params: Promise<{ categories: string[], slug: string }> }) {

    const { categories, slug } = await params;
    if(!slug && !categories){
        return {
            title: 'Noticia no encontrada',
            description: 'La noticia que buscas no existe.',
        };
    }

    else if(categories && slug === null){
        return {
            title: `Categoría: ${categories.join(', ')}`,
            description: `Posts under the categories: ${categories.join(', ')}`,
        };
    }
    else {
       const response = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/posts?slug=${slug}&_embed`);
        const posts = await response.json() as Post[];

        const postSingle = posts[0];

        return {
            title: postSingle.title.rendered,
            description: postSingle.excerpt.rendered,
            openGraph: postSingle.yoast_head_json,

        };
    }
    
};



export default async function Noticias({ params }: { params: Promise<{ categories: string[], slug: string }> }) {
    const { categories, slug } = await params;

    if(!slug && !categories){
        return <div>Noticia no encontrada</div>
    }

    else if(categories && slug === null){
        const response = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/posts?categories=${categories.join(",")}`);
        const posts = await response.json();
        return (
            <NoticiasPorCategoria slug={categories[categories.length - 1]} />
        );
    }else{
        return (
            <Noticia slug={slug} />
        )
    }
}