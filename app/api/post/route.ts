import {NextRequest, NextResponse} from "next/server";

import {createClient} from "@/lib/supabase/server";


import type {Post} from "@/Types/Posts";

export async function GET(req: NextRequest) {
    try {
        // 1. OBTENER PARÁMETROS DE PAGINACIÓN DE LA URL DE NEXT.JS
        // Ejemplo: /api/post?page=2
        const searchParams = req.nextUrl.searchParams;
        const page = searchParams.get('page') || '1';
        const perPage = '10'; // Puedes hacerlo dinámico si quieres

        // 2. HACER EL FETCH A WORDPRESS
        // Añadimos cache: 'no-store' para que SIEMPRE traiga datos frescos al recargar.
        const response = await fetch(
            `https://periodiconaranja.es/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}`, 
            { 
                cache: 'no-store' 
            }
        );

        // Manejo específico para cuando pides una página que no existe (ej: página 500)
        // WordPress devuelve 400 Bad Request en este caso.
        if (!response.ok) {
            if (response.status === 400) {
                 return NextResponse.json({ posts: [], totalPages: 0 }, { status: 200 });
            }
            throw new Error(`WordPress API returned ${response.status}`);
        }

        // 3. CAPTURAR EL TOTAL DE PÁGINAS (Viene en las cabeceras de WP)
        const totalPages = response.headers.get('X-WP-TotalPages') || '1';
        
        const posts = await response.json();
        
        if (!Array.isArray(posts)) {
            throw new Error('Expected posts to be an array');
        }

        // --- LÓGICA DE MAPEO (OPTIMIZADA CON CACHÉ) ---

        // Collect unique category IDs
        const categoryIds = Array.from(new Set(posts.flatMap((p: any) => Array.isArray(p.categories) ? p.categories : []))).filter(Boolean);
        let categories: any[] = [];
        
        if (categoryIds.length > 0) {
            // A las categorías les ponemos caché de 1 hora (3600s) porque cambian poco.
            // Esto hace que la carga sea mucho más rápida.
            const categoriesResponse = await fetch(
                `https://periodiconaranja.es/wp-json/wp/v2/categories?include=${categoryIds.join(',')}&per_page=100`,
                { next: { revalidate: 3600 } } 
            );
            
            if (categoriesResponse.ok) {
                const categoriesJson = await categoriesResponse.json();
                categories = Array.isArray(categoriesJson) ? categoriesJson : [categoriesJson];
            }
        }

        // Collect unique author IDs
        const authorIds = Array.from(new Set(posts.map((p: any) => p.author).filter(Boolean)));
        let authors: any[] = [];
        
        if (authorIds.length > 0) {
            // A los autores también les ponemos caché.
            const authorsResponse = await fetch(
                `https://periodiconaranja.es/wp-json/wp/v2/users?include=${authorIds.join(',')}`,
                { next: { revalidate: 3600 } }
            );
            
            if (authorsResponse.ok) {
                const authorsJson = await authorsResponse.json();
                authors = Array.isArray(authorsJson) ? authorsJson : [authorsJson];
            }
        }

        // Map embedded data
        const mappedPosts = posts.map((post: any) => ({
            ...post,
            author: authors.find((a: any) => a.id === post.author) || null,
            categories: Array.isArray(post.categories) ? categories.filter((c: any) => post.categories.includes(c.id)) : [],
        }));

        // 4. DEVOLVER OBJETO CON POSTS Y METADATA
        // Cambiamos la estructura para enviar también el número total de páginas
        return NextResponse.json({
            posts: mappedPosts,
            totalPages: parseInt(totalPages)
        }, { status: 200 });

    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL POST FETCHING API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during fetching post.", details: errorMessage },
            { status: 500 }
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
        }]).select('*').single() as {data: any | null, error: Error | null};
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


