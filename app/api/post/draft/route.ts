import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    // 1. AUTORIZACIÓN: Obtenemos el rol del usuario
    if (!user) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
    const { data: role } = await supabase.rpc('get_my_role');
    const userRole = role as string;

    if (!['admin', 'editor', 'author'].includes(userRole)) {
        return NextResponse.json({ error: 'Permiso denegado. Rol insuficiente para crear borrador.' }, { status: 403 });
    }

    // 2. EXTRACCIÓN DE DATOS
    const body = await request.json();
    const { title, slug, content, excerpt, categoryIds, featuredImage } = body;

    // Validación mínima para borrador (solo requerimos título y autor)
    if (!title || !slug) {
        // En tu código Express, solo requerías título. Aquí requerimos título y slug.
        return NextResponse.json({ error: 'Faltan campos requeridos (título y slug).' }, { status: 400 });
    }

    try {
        // 3. Insertar Post como Borrador
        const postData = {
            title,
            slug,
            content: content || '', // Contenido puede estar vacío
            excerpt,
            author_id: user.id,
            featured_image: featuredImage,
            is_published: false, // 🚨 CLAVE: Lo marcamos como borrador
            published_at: null,
        };

        // 4. Insertar en la base de datos
        const { data, error: postError } = await supabase
            .from('posts')
            .insert(postData)
            .select('id')
            .single();

        if (postError) throw postError;
        const postId = data.id;

        // 5. Manejo de Categorías (Igual que en la ruta principal)
        if (categoryIds && categoryIds.length > 0) {
            const categoryLinks = categoryIds.map((categoryId: string) => ({
                post_id: postId,
                category_id: categoryId,
            }));
            await supabase.from('post_categories').insert(categoryLinks);
        }

        return NextResponse.json({ success: true, postId, message: 'Borrador guardado' }, { status: 201 });

    } catch (error: any) {
        console.error('Error saving draft:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}