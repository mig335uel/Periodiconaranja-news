import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session) {
      const user = session.user;
      
      // Usamos el cliente admin para poder insertar sin problemas de RLS (como en tu api de register)
      const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1. Comprobar si el usuario ya existe en public.users
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      // 2. Si no existe, lo insertamos
      if (!existingUser) {
        const googleData = user.user_metadata;
        await supabaseAdmin.from('users').insert({
            id: user.id,
            name: googleData.given_name || googleData.full_name || 'Usuario',
            last_name: googleData.family_name || '',
            email: user.email,
            image: googleData.avatar_url || googleData.picture,
            display_name: googleData.full_name,
            role: 'viewer'
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=CouldNotAuthenticate`);
}
