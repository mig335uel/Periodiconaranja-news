// src/app/api/elecciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ⚙️ CONFIGURACIÓN GLOBAL
// Cambiar a true cuando tengas el link para el sábado
const USE_REMOTE = false;
const REMOTE_API_URL = 'https://URL_PENDIENTE_DEL_SABADO.com'; // ⚠️ REEMPLAZAR AQUÍ
const REMOTE_USER = ''; // Si requiere auth
const REMOTE_PASS = ''; // Si requiere auth

// Configuración Local
const LOCAL_CSV_FILENAME = '502TOT99AU_005.CSV';
const LOCAL_CSV_ID = '502'; // ID ficticio para simular nueva versión

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode');
  const id = searchParams.get('id');

  try {
    // ---------------------------------------------------------
    // A) MODO REMOTO (Cuando te den el link)
    // ---------------------------------------------------------
    if (USE_REMOTE) {
      if (!REMOTE_API_URL || REMOTE_API_URL.includes('URL_PENDIENTE')) {
        return NextResponse.json({ error: 'Falta configurar la URL Remota en route.ts' }, { status: 500 });
      }

      // Construir URL remota según la documentación que te den
      // Suponiendo una estructura similar a la anterior:
      let targetUrl = '';
      if (mode === 'check') {
        // Ajustar endpoint según te digan
        targetUrl = `${REMOTE_API_URL}/endpoint-check`;
      } else if (mode === 'download') {
        targetUrl = `${REMOTE_API_URL}/endpoint-download/${id}`;
      }

      // Headers (Auth si hace falta)
      const headers: HeadersInit = {};
      if (REMOTE_USER && REMOTE_PASS) {
        headers['Authorization'] = 'Basic ' + Buffer.from(`${REMOTE_USER}:${REMOTE_PASS}`).toString('base64');
      }

      const response = await fetch(targetUrl, { headers, cache: 'no-store' });

      if (!response.ok) {
        return NextResponse.json({ error: `Error remoto: ${response.status}` }, { status: response.status });
      }

      const fileBuffer = await response.arrayBuffer();
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'text/plain; charset=iso-8859-1', // O la que corresponda
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // ---------------------------------------------------------
    // B) MODO LOCAL (Actual)
    // ---------------------------------------------------------

    // 1. MODO CHECK: Devuelve el ID de la "última versión"
    if (mode === 'check') {
      return new NextResponse(LOCAL_CSV_ID, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 2. MODO DOWNLOAD: Devuelve el contenido del CSV local
    if (mode === 'download') {
      // Si el cliente pide un ID diferente, podríamos forzar el nuestro o ignorarlo.
      // Aquí simplemente servimos el archivo local siempre.

      const filePath = path.join(process.cwd(), 'public', 'data', LOCAL_CSV_FILENAME);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Archivo de datos no encontrado' }, { status: 404 });
      }

      // Leemos el archivo. Nota: fs.readFileSync devuelve Buffer por defecto.
      const fileBuffer = fs.readFileSync(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}