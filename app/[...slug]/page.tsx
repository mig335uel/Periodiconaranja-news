import { Metadata } from "next";
import { notFound } from "next/navigation";
import NoticiasPorCategoria from "@/components/ui/NoticiasPorCategoria";
import Noticia_Precargada from "@/components/ui/Noticia_precargada"; // Usamos el componente que acepta datos directos

// --- 1. FUNCIÓN DE RESOLUCIÓN UNIFICADA (Detecta qué es la URL) ---
async function resolveUrl(slugPath: string[]) {
  const rawSlug = slugPath[slugPath.length - 1];
  const slug = decodeURIComponent(rawSlug); // Importante para tildes

  // A. Intentar buscar POST
  try {
    const postRes = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/posts?slug=${slug}&_embed`, { next: { revalidate: 60 } });
    if (postRes.ok) {
      const posts = await postRes.json();
      if (posts.length > 0) return { type: 'post', data: posts[0] };
    }
  } catch (e) { console.error(e); }

  // B. Intentar buscar CATEGORÍA (Para obtener el ID)
  try {
    const catRes = await fetch(`https://periodiconaranja.es/wp-json/wp/v2/categories?slug=${slug}`, { next: { revalidate: 3600 } });
    if (catRes.ok) {
      const cats = await catRes.json();
      if (cats.length > 0) return { type: 'category', data: cats[0] };
    }
  } catch (e) { console.error(e); }

  return null; // No es nada (404)
}

// --- 2. GENERACIÓN DE METADATOS (SEO) ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await resolveUrl(slug);

  if (!result) return { title: "Página no encontrada" };

  if (result.type === 'post') {
    const post = result.data;
    return {
      title: post.yoast_head_json?.title || post.title.rendered,
      description: post.yoast_head_json?.description || "Noticia de Periódico Naranja",
      openGraph: {
        images: post.yoast_head_json?.og_image || [],
      }
    };
  }

  if (result.type === 'category') {
    return {
      title: `${result.data.name} | Periódico Naranja`,
      description: `Todas las noticias sobre ${result.data.name}`,
    };
  }

  return {};
}

// --- 3. COMPONENTE DE PÁGINA ---
export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;

  // Resolvemos qué es antes de renderizar
  const result = await resolveUrl(slug);

  // Si no existe ni como post ni como categoría -> 404 real
  if (!result) {
    notFound();
  }

  // CASO A: Es un POST
  if (result.type === 'post') {
    // Pasamos los datos COMPLETOS (data) para no volver a hacer fetch
    return <Noticia_Precargada post={result.data} />;
  }

  // CASO B: Es una CATEGORÍA
  if (result.type === 'category') {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">{result.data.name}</h1>
        {/* PASAMOS EL ID: Esto es lo que arregla tu problema */}
        <NoticiasPorCategoria 
          slug={result.data.slug} 
          categoryId={result.data.id} 
        />
      </main>
    );
  }

  return notFound();
}