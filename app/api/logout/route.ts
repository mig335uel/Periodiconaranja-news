import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';



export async function GET(req: NextRequest) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: "Sesión cerrada."
    }, { status: 200 });
}