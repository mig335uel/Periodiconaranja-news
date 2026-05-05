import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';

// 1. Inicializamos la conexión segura con el servidor de Pusher
// Usamos el "!" para decirle a TypeScript que estas variables existirán sí o sí
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 2. SEGURIDAD: Verificamos que la petición viene realmente de TU WordPress.
    // Esto evita que cualquiera pueda hacer un POST y meter "fake news" en el directo.
    if (body.secret !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ message: 'Token inválido o no autorizado' }, { status: 401 });
    }

    // 3. Extraemos los datos que nos manda el plugin PHP
    const { postId, action, data } = body;

    // Validación básica
    if (!postId || !action) {
      return NextResponse.json({ message: 'Faltan parámetros (postId o action)' }, { status: 400 });
    }

    // 4. LA MAGIA: Disparamos el evento.
    // - Canal: `live-updates-1234` (1234 sería el ID de la noticia)
    // - Evento: 'new-update' o 'delete-update'
    // - Data: El JSON con el id, title, content, date, etc.
    await pusher.trigger(`live-updates-${postId}`, action, data);

    return NextResponse.json({ success: true, message: 'Evento de Pusher enviado correctamente' });
    
  } catch (err) {
    console.error("Error enviando el evento a Pusher:", err);
    return NextResponse.json({ message: 'Error interno del servidor al conectar con Pusher' }, { status: 500 });
  }
}