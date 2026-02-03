// eslint-disable @typescript-eslint/no-unused-vars

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type Context = {
    params: Promise<{ user_id: string }>;
};

interface UpdateUser {
    id: string;
    name: string;
    last_name: string;
    email: string;
    password: string;
    display_name?: string;
}

export async function GET(req: NextRequest, context: Context) {
    const { user_id } = await context.params;
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.from('users').select('*').eq('id', user_id).single();
        if (error) return NextResponse.json({ message: "el usuario no existe" }, { status: 404 });
        return NextResponse.json(data, { status: 200 });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL AUTHORS FETCHING API CRASH:", e);

        return NextResponse.json(
            { error: "Internal Server Error during fetching authors.", details: errorMessage },
            { status: 500 }
        );
    }
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
    try {
        const { user_id } = await params;
        const actualizarUsuario: UpdateUser = await req.json();
        const supabase = await createClient();

        // 1. Actualizar datos públicos en la tabla 'users'
        const { data: profileData, error: profileError } = await supabase
            .from('users').update({
                name: actualizarUsuario.name,
                last_name: actualizarUsuario.last_name,
                display_name: actualizarUsuario.display_name,

            }).eq('id', user_id);

        if (profileError) {
            console.error("Error updating public profile:", profileError);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        // 2. Actualizar datos de autenticación (Email, Metadata y, opcionalmente, Contraseña)
        const authUpdates: { email?: string; password?: string; data?: object } = {
            email: actualizarUsuario.email,
            data: {
                name: actualizarUsuario.name,
                last_name: actualizarUsuario.last_name,
                full_name: `${actualizarUsuario.name} ${actualizarUsuario.last_name}`,
            }
        };

        if (actualizarUsuario.password && actualizarUsuario.password.trim() !== "") {
            authUpdates.password = actualizarUsuario.password;
        }

        const { error: authError } = await supabase.auth.updateUser(authUpdates);

        if (authError) {
            console.error("Error updating auth user:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Usuario actualizado correctamente" }, { status: 200 });

    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error Desconocido";
        console.error("Critical error in PUT /api/users/[user_id]:", e);
        return NextResponse.json({ error: "Internal Server Error during user update.", details: errorMessage }, { status: 500 });
    }
}