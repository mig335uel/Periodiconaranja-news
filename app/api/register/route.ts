// import { createClient, SupabaseClient, UserResponse } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// 🚨 Define la forma de los datos que vas a insertar en public.users
interface ProfileInsert {
    id: string; // El UUID del usuario de auth.users
    name: string;
    last_name: string;
    display_name?: string;
    role: 'admin' | 'editor' | 'author' | 'viewer';
}

export async function POST(request: NextRequest) {
    const {name, last_name, display_name, email, password} = await request.json();

    // 1. VALIDACIÓN DE ENTRADA
    if (!name || !last_name || !email || !password) {
        return NextResponse.json({error: "Todos los campos son obligatorios."}, {status: 400});
    }


    const supabase =  await createClient();
    // 2. CONFIGURACIÓN DEL CLIENTE DE ADMINISTRADOR (Admin Client)
    // Este cliente utiliza la llave secreta para bypass RLS.
    /*const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );*/

    // Asignamos el rol por defecto (por ejemplo, 'author' para un nuevo periodista)
    const defaultRole: ProfileInsert['role'] = 'viewer';
    const displayName = display_name ? display_name : `${name} ${last_name}`;

    try {
        // 3. CREAR USUARIO EN AUTH.USERS
        const { data: userData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    last_name,
                    full_name: displayName,
                },
            },
        });

        if (authError) {
            return NextResponse.json({error: authError.message}, {status: 400});
        }

        const user = userData.user;
        if (!user) {
            throw new Error("El objeto de usuario está vacío después de la creación.");
        }

        // 4. PREPARAR DATOS PARA PUBLIC.USERS
        const profileData: ProfileInsert = {
            id: user.id, // El ID de 'auth.users'
            name: user.user_metadata?.name ?? name,
            last_name: user.user_metadata?.last_name ?? last_name,
            role: defaultRole,
        };

        // 5. INSERTAR PERFIL en public.users (El paso crítico)
        const { data: profileResult, error: profileError } = await supabase
            .from('users') // Usando tu tabla 'users'
            .insert(profileData);

        if (profileError) {
            // 🚨 Si este paso falla, el usuario existe en auth.users pero no tiene perfil.
            // Se recomienda borrar el usuario de auth.users aquí (ROLLBACK) para evitar fantasmas.
            return NextResponse.json({error: profileError.message}, {status: 500});
        }

        // 6. RESPUESTA DE ÉXITO
        return NextResponse.json({
            message: "Usuario creado y perfil registrado.",
            user: profileResult,
        }, {status: 201});

    } catch (e: any) {
        console.error("Error crítico en el registro:", e.message);
        return NextResponse.json({error: "Error en el registro."}, {status: 500});
    }
}