import { notFound } from "next/navigation";
import NewsViewer from "@/components/NewsViewer"; // Tu visor de noticias
import NoticiasPorCategoria from "@/components/ui/NoticiasPorCategoria"; // Tu componente de categorías
import Noticia_Precargada from "@/components/ui/Noticia_precargada";
// Importa aquí otros componentes si tienes (ej: PageViewer)

// Función auxiliar para averiguar qué es el SLUG consultando a tu API/WordPress
async function resolveUrl(slugPath: string[]) {
  const slug = slugPath[slugPath.length - 1]; // Normalmente el último segmento es el ID/Slug

  // 1. Intentar buscar como POST
  try {
    const postRes = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/posts?slug=${slug}&_embed`, { next: { revalidate: 60 } });
    if (postRes.ok) {
      const posts = await postRes.json();
      if (posts.length > 0) {
        // Mapear datos como haces en tu API
        const postRaw = posts[0];
        return {
          type: 'post',
          data: {
            ...postRaw,
            author: postRaw._embedded?.author?.[0] || postRaw.author,
            categories: postRaw._embedded?.['wp:term']?.[0] || [],
          }
        };
      }
    }
  } catch (e) { console.error(e); }

  // 2. Si no es Post, intentar buscar como CATEGORÍA
  try {
    const catRes = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/categories?slug=${slug}`, { next: { revalidate: 3600 } });
    if (catRes.ok) {
      const cats = await catRes.json();
      if (cats.length > 0) {
        return { type: 'category', data: cats[0] };
      }
    }
  } catch (e) { console.error(e); }

  return null; // No encontrado
}

// COMPONENTE DE SERVIDOR PRINCIPAL
export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;

  // Resolvemos qué es esto en el SERVIDOR (sin spinners de carga)
  const result = await resolveUrl(slug);

  if (!result) {
    notFound(); // Muestra 404 si no existe en WP
  }

  // Renderizado Condicional de Servidor (SSR)
  if (result.type === 'post') {
    return (
      <article>
        {/* NewsViewer recibe los datos ya cargados, nada de useEffect dentro que bloquee el render */}
        <Noticia_Precargada post={result.data} />
      </article>
    );
  }

  if (result.type === 'category') {
    return (
      <main>
        <h1>{result.data.name}</h1>
        <NoticiasPorCategoria slug={result.data.slug} />
      </main>
    );
  }

  return notFound();
}