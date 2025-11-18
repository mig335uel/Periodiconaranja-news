// typescript

import { createClient } from '@/lib/supabase/server'; // Para el Client con Auth
import { NextResponse } from 'next/server';

// CLIENTE 1: El cliente de Administrador (para subir el archivo, bypass RLS)


export async function POST(req: Request) {

    // CLIENTE 2: El cliente con contexto de usuario (para leer el token de sesión)
    const supabase = await createClient();

    // AUTENTICACIÓN: Obtener el usuario logueado (desde la cookie)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'No autorizado. Debes iniciar sesión.' }, { status: 401 });
    }

    // AUTORIZACIÓN: Obtener el rol y verificar los permisos
    const { data: userRole } = await supabase.rpc('get_my_role');

    if (!userRole || !['admin', 'editor', 'author'].includes(userRole as string)) {
        return NextResponse.json({ error: 'Permiso denegado. Rol insuficiente para subir imágenes.' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const fileHandle = formData.get('image');
        const slugRaw = formData.get('slug');

        // Validaciones estrictas y seguras
        if (!(fileHandle instanceof File)) {
            return NextResponse.json({ error: 'Imagen inválida o no enviada.' }, { status: 400 });
        }
        if (typeof slugRaw !== 'string' || !slugRaw.trim()) {
            return NextResponse.json({ error: 'Slug inválido o no enviado.' }, { status: 400 });
        }

        const file = fileHandle;
        const slug = slugRaw.trim();

        // Preparación de la ruta
        const fileExt = file.name.split('.').pop() ?? 'bin';
        const newFileName = `${Date.now()}.${fileExt}`;
        const bucketName = 'Storage'; // Tu nombre de bucket
        const filePath = `uploads/${slug}/${newFileName}`; // uploads/slug/nombre.ext

        // Subir el archivo (Usando el CLIENTE ADMIN que tiene permisos totales)
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Error de Storage:', uploadError);
            return NextResponse.json({ error: 'Fallo la subida a Supabase Storage.' }, { status: 500 });
        }

        // Devolver la URL pública
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${encodeURIComponent(filePath)}`;

        return NextResponse.json({ success: true, url: publicUrl }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Upload handler error:', message);

        // TEMPORAL: Muestra si el cliente pudo obtener tu sesión
        const { data: { user: diagnosticUser } } = await supabase.auth.getUser();
        console.log('DIAG: User ID Check:', diagnosticUser?.id);

        return NextResponse.json({ error: message || 'Error al procesar la subida' }, { status: 500 });
    }
}
