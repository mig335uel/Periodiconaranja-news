import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {Post, Category} from "@/Types/Posts";


type Context = {
    params: Promise<{ slug: string }>;
};
interface PostsDataUpdate {
    id:string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    categoryIds?: string[];
    authorId: string;
    featuredImage?: string | null;
    isPublished?: true;
}




export async function GET(req: NextRequest, {params}:{params: any }) {
    const parametro = await params;
    const slug = parametro.slug as string;
    
    let posts; // Declared outside try block as per instruction snippet
    try{
        // Fetch from WordPress API using slug
        const response = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/posts?slug=${slug}&_embed`);
        
        if (!response.ok) {
             throw new Error(`WordPress API returned ${response.status}`);
        }
        posts = await response.json(); // Assign to posts variable

        if (!posts || posts.length === 0) {
            return NextResponse.json({error: "Post not found"}, {status: 404});
        }

        const postRaw = posts[0];
        
        // Map embedded data
        const post = {
            ...postRaw,
            author: postRaw._embedded?.author?.[0] || postRaw.author,
            categories: postRaw._embedded?.['wp:term']?.[0] || [], 
            // tags usually at [1]
        };

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
// PUT - Actualiza un Post existente
export async function PUT(req: NextRequest, context: Context){
    // CORREGIDO: Se accede directamente a params.slug
    const { slug } = await context.params;
    const supabase = await createClient();

    try{
        const postsData: PostsDataUpdate = await req.json();

        // 1. Obtener el Post existente por el SLUG para comparación (comprobación de existencia)
        // CORREGIDO: La tabla se llama 'posts', no 'post'
        const {data: currentPost, error: compError} = await supabase.from('posts').select('id').eq('id', slug).maybeSingle();
        if(compError) return NextResponse.json({message: "Error al comparar el post: " + compError.message},{status: 400});
        if(!currentPost) return NextResponse.json({message: "Post no encontrado para actualizar"},{status: 404});
        
        const postId = currentPost.id;
        
        const newCategoryIds = postsData.categoryIds || [];
        const updatedPost = {
            slug: postsData.slug,
            title: postsData.title,
            content: postsData.content,
            excerpt: postsData.excerpt,
            featured_image: postsData.featuredImage,
            is_published: postsData.isPublished
        };
        // --- ACTUALIZACIÓN DEL POST PRINCIPAL ---
        const { error: updateError } = await supabase
            .from('posts')
            .update({
                slug: postsData.slug,
                title: postsData.title,
                content: postsData.content,
                excerpt: postsData.excerpt,
                featured_image: postsData.featuredImage,
                is_published: postsData.isPublished
            })
            .eq('id', postId);
        
        if (updateError) {
            console.error("Error updating post:", updateError);
            return NextResponse.json({ error: "Error al actualizar campos del post.", details: updateError.message }, { status: 400 });
        }


        // --- GESTIÓN DE CATEGORÍAS (Relación muchos a muchos) ---
        
        // 2. Obtener categorías actuales
        const { data: currentCategories, error: currentCategoriesError } = await supabase
            .from('post_categories')
            .select('category_id')
            .eq('post_id', postId);

        if (currentCategoriesError) {
             console.error("Error fetching current categories:", currentCategoriesError);
             return NextResponse.json({ error: "Error al obtener categorías actuales.", details: currentCategoriesError.message }, { status: 400 });
        }

        const existingCategoryIds = currentCategories?.map(c => c.category_id) || [];

        // 3. Detectar categorías a ELIMINAR
        const categoriesToDelete = existingCategoryIds.filter(id => !newCategoryIds.includes(id));
        
        if (categoriesToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('post_categories')
                .delete()
                .eq('post_id', postId)
                .in('category_id', categoriesToDelete);
                
            if (deleteError) {
                console.error("Error deleting categories:", deleteError);
                return NextResponse.json({ error: "Error al eliminar categorías antiguas.", details: deleteError.message }, { status: 400 });
            }
        }
        

        // 4. Detectar categorías a AÑADIR
        const categoriesToAdd = newCategoryIds.filter(id => !existingCategoryIds.includes(id));
        
        if (categoriesToAdd.length > 0) {
            const newRelations = categoriesToAdd.map(id => ({ 
                post_id: postId, 
                category_id: id 
            }));

            const { error: insertError } = await supabase
                .from('post_categories')
                .insert(newRelations);
            
            if (insertError) {
                console.error("Error inserting new categories:", insertError);
                return NextResponse.json({ error: "Error al añadir categorías nuevas.", details: insertError.message }, { status: 400 });
            }
        }

        return NextResponse.json({ message: "Post actualizado exitosamente", id: postId }, { status: 200 });
        
    }catch(e: unknown){
        const errorMessage = e instanceof Error ? e.message: "Error desconocido";
        console.error("CRITICAL POST UPDATING API CRASH:", e);
        return NextResponse.json({error: "Internal Server Error during post update.", details: errorMessage}, {status: 500});
    }
}



export async function DELETE(req: NextRequest, context: Context) {
    const slug = await context.params;
    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        const supabase = await createClient();
        const {error: postError } = await supabase
            .from('posts')
            .delete()
            .eq('slug', slug);

        if (postError) {
            return NextResponse.json({ error: postError.message }, { status: 400 });
        }
        
        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POST DELETING API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during deleting post.", details: errorMessage },
            { status: 500 }
        );
    }
}