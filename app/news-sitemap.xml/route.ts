/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Asegura que siempre se busquen datos frescos

export async function GET() {
    try {
        // 1. Calcular la fecha de hace 48 horas (Google News requirement: posts < 48h)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const afterDate = twoDaysAgo.toISOString();

        // 2. Fetch posts de WordPress creados después de esa fecha
        // Pedimos campos necesarios: slug, date, title
        const res = await fetch(
            `${process.env.CMS_URL}/wp-json/wp/v2/posts?per_page=100&after=${afterDate}&_fields=slug,date,title`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            console.error('Error fetching posts for news sitemap:', res.status);
            return new NextResponse('Error generating sitemap', { status: 500 });
        }

        const posts = await res.json();

        // 3. Generar el XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      ${posts.map((post: any) => `
      <url>
        <loc>https://www.periodiconaranja.es/noticia/${post.slug}</loc>
        <news:news>
          <news:publication>
            <news:name>Periodico Naranja</news:name>
            <news:language>es</news:language>
          </news:publication>
          <news:publication_date>${post.date}</news:publication_date>
          <news:title>${escapeXml(post.title?.rendered || '')}</news:title>
        </news:news>
      </url>
      `).join('')}
    </urlset>`;

        // 4. Retornar con el Content-Type correcto
        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });

    } catch (error) {
        console.error('Error in news-sitemap:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// Función auxiliar para escapar caracteres en XML (simple)
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
