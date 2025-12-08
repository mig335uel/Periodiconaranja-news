// src/app/api/proxy-elecciones/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ⚙️ CONFIGURACIÓN (Pon tus datos reales aquí también)
const API_URL_REMOTE = 'https://prensa.elecciones2025.juntaex.es'; 

const USER = 'ursextre101';

const PASS = 'Maewik7h';


export async function GET(request: NextRequest) {
  // Leemos los parámetros de la URL (?mode=check o ?mode=download&id=005)
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode');
  const id = searchParams.get('id');

  // Construimos la URL de destino
  let targetUrl = '';
  if (mode === 'check') {
    targetUrl = `${API_URL_REMOTE}/descargas/csv/data/getEnvio/510`;
  } else if (mode === 'download' && id) {
    targetUrl = `${API_URL_REMOTE}/descargas/csv/data/getAvancesTotales/510/${id}`;
  } else {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  }

  // Preparamos la autenticación
  const authHeader = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

  try {
    // Hacemos la petición Servidor-a-Servidor (Sin CORS)
    const response = await fetch(targetUrl, {
      headers: { 'Authorization': authHeader },
      cache: 'no-store', // Importante: No cachear para tener datos frescos
      // Si tienes problemas de SSL en local, descomenta la siguiente línea (solo dev):
      // agent: new (require('https').Agent)({ rejectUnauthorized: false }) 
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Error remoto: ${response.status}` }, { status: response.status });
    }

    // Obtenemos el archivo crudo (ArrayBuffer para no romper codificación)
    const fileBuffer = await response.arrayBuffer();

    // Se lo devolvemos al Frontend tal cual
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'text/plain; charset=iso-8859-1', // Mantenemos encoding
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: 'Fallo interno del proxy' }, { status: 500 });
  }
}