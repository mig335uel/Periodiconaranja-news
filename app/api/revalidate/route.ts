import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { secret, path } = await request.json();

    // 1. Comprobamos que la petición viene de tu WordPress usando un token secreto
    if (secret !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: 'Falta la ruta (path) a revalidar' }, { status: 400 });
    }

    // 2. Vercel borra la caché de esa URL específica y la vuelve a generar en milisegundos
    revalidatePath(path);
    
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error interno en la revalidación' }, { status: 500 });
  }
}