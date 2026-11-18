import { NextRequest, NextResponse } from 'next/server';

const REMOTE_API_URL = process.env.ELECCIONES_GENERALES_URL;
const REMOTE_USER = process.env.ELECCIONES_GENERALES_USERNAME;
const REMOTE_PASS = process.env.ELECCIONES_GENERALES_PASSWORD;

// Códigos oficiales de elección: '2' = Congreso, '3' = Senado
const DEFAULT_ELECTION_ID = '2';

function decodeCsvBuffer(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('iso-8859-1').decode(buffer);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode'); // 'check' | 'download' | 'oldData' | 'avances'
  const id = searchParams.get('id');
  const camara = searchParams.get('camara'); // 'congreso' | 'senado'
  const electionId = camara === 'senado' ? '3' : DEFAULT_ELECTION_ID;

  try {
    if (!REMOTE_API_URL) {
      return NextResponse.json(
        { error: 'Falta configurar ELECCIONES_GENERALES_URL' },
        { status: 500 }
      );
    }

    const trimmedUrl = REMOTE_API_URL.trim().replace(/\/+$/, '');
    const baseUrl = /^https?:\/\//i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;
    const headers: HeadersInit = {
      'Cache-Control': 'no-cache',
    };

    if (REMOTE_USER && REMOTE_PASS) {
      const authString = Buffer.from(`${REMOTE_USER}:${REMOTE_PASS}`).toString('base64');
      headers['Authorization'] = `Basic ${authString}`;
    }

    let targetUrl = '';

    if (mode === 'check') {
      targetUrl = `${baseUrl}/descargas/csv/data/getEnvio/${electionId}?t=${Date.now()}`;
    } else if (mode === 'download') {
      if (!id) return NextResponse.json({ error: 'Falta ID de envío' }, { status: 400 });
      targetUrl = `${baseUrl}/descargas/csv/data/getEscrutinioTotales/${electionId}/${id}`;
    } else if (mode === 'oldData') {
      targetUrl = `${baseUrl}/descargas/csv/fijos/getEscrutinioTotales/ANT/${electionId}/07-23`;
    } else if (mode === 'avances') {
      if (!id) return NextResponse.json({ error: 'Falta ID de envío' }, { status: 400 });
      targetUrl = `${baseUrl}/descargas/csv/data/getAvancesTotales/${electionId}/${id}`;
    } else {
      return NextResponse.json({ error: 'Modo desconocido' }, { status: 400 });
    }

    const response = await fetch(targetUrl, { headers, cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error remoto: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    const text = decodeCsvBuffer(buffer);
    const contentType =
      mode === 'check' ? 'text/plain; charset=utf-8' : 'text/csv; charset=utf-8';

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('API Generales Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
