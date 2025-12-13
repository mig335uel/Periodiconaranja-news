import type { Post, Author, Category } from "@/Types/Posts";
import Noticia from "@/components/ui/Noticia";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// ----------------------------------------------------
// 1. FUNCIÓN DE MAPEO
// Transforma el objeto crudo de la API en el objeto Post (Types/Posts.ts)
// ----------------------------------------------------
function mapWordPressPost(wpPost: any): Post {
  // Los datos incrustados del autor (usando ?_embed)
  const authorData = wpPost._embedded?.author?.[0];
  // Los datos incrustados de categorías (usando ?_embed)
  const categoryData = wpPost._embedded?.["wp:term"]?.[0]?.flat() || [];

  // Mapeo de la interfaz Author
  const mappedAuthor: Author = {
    id: authorData?.id || 0,
    name: authorData?.name || "Redacción",
    url: authorData?.link || "",
    description: authorData?.description || "",
    link: authorData?.link || "",
    slug: authorData?.slug || "",
    avatar_urls: authorData?.avatar_urls || {},
    // Usamos la propiedad de Ultimate Member (um_avatar_url) si existe
    um_avatar_url:
      authorData?.um_avatar_url || authorData?.avatar_urls?.["96"] || "",
    yoast_head_json: authorData?.yoast_head_json || ({} as any), // Cuidado con los tipos vacíos
    _links: authorData?._links || {},
  };

  // Mapeo de la interfaz Post
  return {
    // Campos directos
    id: wpPost.id,
    date: wpPost.date,
    slug: wpPost.slug,
    type: wpPost.type,

    // Campos que son objetos { rendered: '...' }
    title: { rendered: wpPost.title.rendered },
    content: {
      rendered: wpPost.content.rendered,
      protected: wpPost.content.protected || false,
    },
    excerpt: {
      rendered: wpPost.excerpt.rendered,
      protected: wpPost.excerpt.protected || false,
    },

    // Relaciones (ya mapeadas)
    author: mappedAuthor,
    categories: categoryData as Category[], // Usamos el cast simple después de un mapeo simple

    // Media y SEO
    featured_media: wpPost.featured_media || 0,
    jetpack_featured_media_url: wpPost.jetpack_featured_media_url || "",
    yoast_head_json: wpPost.yoast_head_json || ({} as any),

    // Añadir el resto de campos desconocidos de forma segura
    ...wpPost,
  } as Post;
}

// ----------------------------------------------------
// 2. FUNCIÓN DE FETCHING
// Ahora usa la función de mapeo
// ----------------------------------------------------
export async function fetchNoticia(slug: string): Promise<Post | null> {
  try {
    // Nota: Usar process.env.NEXT_PUBLIC_WORDPRESS_API_URL en un entorno real
    const apiBaseUrl = "https://periodiconaranja.es/wp-json/wp/v2";

    const response = await fetch(
      `${apiBaseUrl}/posts?slug=${slug}&_embed`,
      // Añadimos no-store para asegurar que la noticia es fresca (no cacheada en el build)
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error(`Error al obtener post: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      // Usamos la función de mapeo para asegurar el tipo Post completo
      return mapWordPressPost(data[0]);
    }
    return null;
  } catch (e) {
    console.error("Error fetching noticia:", e);
    return null;
  }
}

// ----------------------------------------------------
// 3. GENERATE METADATA
// Usamos los campos mapeados (title y excerpt)
// ----------------------------------------------------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const noticia = await fetchNoticia(slug);

  if (!noticia) {
    return { title: "Noticia no encontrada" };
  }

  // Usamos el excerpt limpio como descripción, y el title mapeado
  const description =
    noticia.excerpt.rendered
      .replace(/<[^>]*>?/gm, "") // Limpiamos HTML del excerpt
      .substring(0, 160) + "...";

  return {
    title: noticia.title.rendered,
    description: description,
    // Puedes añadir más campos de Yoast aquí si los mapeas en mapWordPressPost
    // openGraph: { title: noticia.yoast_head_json.og_title, ... }
  };
}

// ----------------------------------------------------
// 4. COMPONENTE DE PÁGINA
// ----------------------------------------------------
export default async function Noticias({ params }: Props) {
  const { slug } = await params;
  const noticia = await fetchNoticia(slug);

  // Pasamos el slug al componente Noticia (que hace su propio fetch en cliente)
  // O idealmente refactorizamos Noticia para aceptar 'post' inicial.
  // Por ahora mantenemos la compatibilidad con Noticia.tsx actual.
  return <Noticia slug={slug} />;
}
