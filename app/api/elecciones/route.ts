// src/app/api/elecciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ⚙️ CONFIGURACIÓN GLOBAL
// ⚠️ IMPORTANTE: Cambia a 'true' el sábado cuando tengas los datos reales
const USE_REMOTE = false; 

// Datos del Servidor (Rellenar el sábado)
const REMOTE_API_URL = 'https://URL_QUE_TE_DEN_EL_SABADO.com'; 
const REMOTE_USER = ''; // Usuario (ej: ursextre...)
const REMOTE_PASS = ''; // Contraseña

// Configuración Fija según PDF (Cortes de Aragón 2026)
const ELECTION_ID = '502'; 

// Configuración Local (Para pruebas ahora)
const LOCAL_CSV_FILENAME = '502TOT99AU_005.CSV';
const LOCAL_ENVIO_ID = '005'; // Simulamos que vamos por el envío 5

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode'); // 'check' o 'download'
  const id = searchParams.get('id');     // Número de envío (solo para download)

  try {
    // =========================================================
    // 📡 A) MODO REMOTO (Producción - Sábado)
    // =========================================================
    if (USE_REMOTE) {
      if (!REMOTE_API_URL || REMOTE_API_URL.includes('URL_QUE_TE_DEN')) {
        return NextResponse.json({ error: 'Falta configurar la URL Remota' }, { status: 500 });
      }

      // 1. Preparar Cabeceras (Auth Basic)
      // Según PDF Pag 4: "usuarios y claves predefinidos"
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache',
      };
      
      if (REMOTE_USER && REMOTE_PASS) {
        const authString = Buffer.from(`${REMOTE_USER}:${REMOTE_PASS}`).toString('base64');
        headers['Authorization'] = `Basic ${authString}`;
      }

      let targetUrl = '';

      // 2. Definir URL según la acción (Check vs Download)
      if (mode === 'check') {
        // Petición para obtener el número de envío actual
        // PDF Pag 7 y 15: /descargas/csv/data/getEnvio/502
        targetUrl = `${REMOTE_API_URL}/descargas/csv/data/getEnvio/${ELECTION_ID}?t=${Date.now()}`;
      } 
      else if (mode === 'download') {
        // Petición para descargar el CSV de escrutinio
        // PDF Pag 6 y 12: /descargas/csv/data/getEscrutinioTotales/502/{numEnv}
        if (!id) return NextResponse.json({ error: 'Falta ID de envío' }, { status: 400 });
        targetUrl = `${REMOTE_API_URL}/descargas/csv/data/getEscrutinioTotales/${ELECTION_ID}/${id}`;
      } 
      else {
        return NextResponse.json({ error: 'Modo desconocido' }, { status: 400 });
      }

      // 3. Ejecutar Petición Fetch
      const response = await fetch(targetUrl, { headers, cache: 'no-store' });

      if (!response.ok) {
        // Si falla (ej: 404 porque no ha empezado), devolvemos error controlado
        return NextResponse.json(
            { error: `Error remoto: ${response.status} ${response.statusText}` }, 
            { status: response.status }
        );
      }

      // 4. Devolver respuesta al frontend
      const data = await response.arrayBuffer();
      
      // Detectar tipo de contenido (texto plano para check, csv para download)
      const contentType = mode === 'check' ? 'text/plain' : 'text/csv; charset=iso-8859-1';

      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // =========================================================
    // 💻 B) MODO LOCAL (Desarrollo / Pruebas)
    // =========================================================

    // 1. CHECK: Simula que el servidor remoto dice "vamos por el envío 005"
    if (mode === 'check') {
      return new NextResponse(LOCAL_ENVIO_ID, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 2. DOWNLOAD: Devuelve el archivo local que subiste para probar
    if (mode === 'download') {
      const filePath = path.join(process.cwd(), 'public', 'data', LOCAL_CSV_FILENAME);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: `Archivo local ${LOCAL_CSV_FILENAME} no encontrado` }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);

      // Los archivos electorales suelen venir en ISO-8859-1 (Latin1). 
      // Si tu archivo local ya está en UTF-8, ajusta el charset abajo.
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'text/csv; charset=iso-8859-1', // Ajustar si tu local es UTF-8
          'Cache-Control': 'no-store, max-age=0',
          'Content-Disposition': `attachment; filename="${LOCAL_CSV_FILENAME}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}