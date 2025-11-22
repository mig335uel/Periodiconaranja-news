/*eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const formData = await req.formData();
        
        // Asignamos tipos para que TypeScript no se queje
        const user_id = formData.get('id') as string;
        const imageProphile = formData.get('image') as File;

        // 1. Validaciones de seguridad
        if (!user_id) {
            return NextResponse.json({ error: 'Falta el ID del usuario.' }, { status: 400 });
        }
        if (!imageProphile || !(imageProphile instanceof File)) {
            return NextResponse.json({ error: 'Imagen inválida o no enviada.' }, { status: 400 });
        }

        // 2. Definir la ruta fija
        // Al llamarse siempre "ProphileImage", sobrescribirá la anterior limpiamente.
        const filePath = `${user_id}/ProphileImage`;

        // 3. Convertir a Buffer (Paso técnico necesario en el servidor)
        const arrayBuffer = await imageProphile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Subir a Supabase
        const { error: uploadError } = await supabase.storage
            .from('users') // <-- Asegúrate que el bucket se llama 'users'
            .upload(filePath, buffer, {
                cacheControl: '3600', // Guarda en caché del navegador por 1 hora
                upsert: true,         // ¡IMPORTANTE! true para reemplazar la foto vieja
                contentType: imageProphile.type // ¡IMPORTANTE! Dice si es image/png o image/jpeg
            });

        if (uploadError) {
            console.error("Error upload:", uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // 5. Generar la URL pública para devolverla al frontend
        const { data: urlData } = supabase.storage
            .from('users')
            .getPublicUrl(filePath);



        const {data, error} = await supabase.from('users').update({ image: urlData.publicUrl }).eq('id', user_id);
        // (Opcional) Si guardas la URL en la tabla de usuarios, descomenta esto:
        // await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', user_id);
        
        return NextResponse.json({ 
            message: 'Imagen subida correctamente', 
            url: urlData.publicUrl 
        }, { status: 200 });

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}