import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { origin } = new URL(request.url);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/api/auth/callback`,
            skipBrowserRedirect: true,
        },
    });
    if (error) {
        return NextResponse.json({ error: error.message });
    }
    return NextResponse.json({ data: data.url });
}
