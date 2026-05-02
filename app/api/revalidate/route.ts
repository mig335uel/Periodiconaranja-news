import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { secret, path } = await request.json();

    if (secret !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: 'Falta la ruta' }, { status: 400 });
    }

    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
       cleanPath = cleanPath.slice(0, -1);
    }

    // Extraemos el slug exacto (la última parte de la URL)
    const urlParts = cleanPath.split('/');
    const slug = urlParts[urlParts.length - 1];

    // 1. INVALIDAMOS EL FETCH DIRECTAMENTE (Data Cache)
    if (slug) {
      revalidateTag(`post-${slug}`, 'all-posts');
      console.log(`Caché de fetch eliminada para el tag: post-${slug}`);
    }

    // 2. INVALIDAMOS LA RUTA (Full Route Cache)
    revalidatePath(cleanPath, 'page');
    revalidatePath('/', 'page'); 

    return NextResponse.json({ 
      revalidated: true, 
      path: cleanPath,
      tagRevalidated: `post-${slug}`,
      now: Date.now() 
    });
    
  } catch (err) {
    console.error("Error revalidando:", err);
    return NextResponse.json({ message: 'Error interno en la revalidación' }, { status: 500 });
  }
}