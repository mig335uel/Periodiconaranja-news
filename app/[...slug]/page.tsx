/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Metadata } from "next";
import { notFound } from "next/navigation"; // Para manejar 404 reales
import Noticia from "@/components/ui/Noticia";
import NoticiasPorCategoria from "@/components/ui/NoticiasPorCategoria";
import { Post } from "@/Types/Posts";
import Noticia_Precargada from "@/components/ui/Noticia_precargada";
// Definimos la interfaz correcta para una ruta Catch-all ([...slug])
interface Props {
  params: Promise<{
    slug: string[]; // Next.js devuelve un array de strings en rutas [...slug]
  }>;
}

// Función auxiliar para buscar el post (cacheada automáticamente por Next.js)
async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.CMS_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      { next: { revalidate: 60 } } // Opcional: caché de 60 segundos
    );
    if (!res.ok) return null;
    const posts = await res.json();

    const mappedPosts: Post[] = posts.map((post: any) => ({
      ...post,
      author: post._embedded?.author?.[0] || post.author,
      categories: post._embedded?.["wp:term"]?.[0]?.flat() || [],
      // tags usually at [1]
    }));
    return mappedPosts.length > 0 ? mappedPosts[0] : null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Seguridad: si no hay slug
  if (!slug || slug.length === 0) {
    return { title: "Página no encontrada" };
  }

  // Obtenemos el último segmento de la URL (puede ser el slug del post o de la categoría)
  const lastSegment = slug[slug.length - 1];

  // 1. Intentamos ver si es un POST
  const post: Post | null = await fetchPost(lastSegment);

  if (post) {
    // Si es un post, devolvemos sus metadatos
    // Mapeamos los datos de Yoast a OpenGraph de Next.js

    return {
      title: post.yoast_head_json?.title || post.title?.rendered,
      description:
        post.yoast_head_json?.description ||
        post.excerpt?.rendered.replace(/<[^>]*>?/gm, ""), // Limpiar HTML
      openGraph: {
        title: post.yoast_head_json?.og_title || post.title?.rendered,
        description: post.yoast_head_json?.og_description,
        images: post.yoast_head_json?.og_image || post.jetpack_featured_media_url,
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.modified,
        authors: [post.author.name || "Periodico Naranja"],
      },
      twitter: {
        title: post.yoast_head_json?.og_title || post.title?.rendered,
        description: post.yoast_head_json?.og_description,
        images: post.yoast_head_json?.og_image || post.jetpack_featured_media_url,
        card: "summary_large_image",
        site: "@periodiconrja",
        creator: post.yoast_head_json?.twitter_creator || "@periodiconrja",
      },
    };
  }

  // 2. Si no es un post, asumimos que es una CATEGORÍA
  // Aquí podrías hacer un fetch a la API de categorías si quisieras el nombre real,
  // por ahora lo formateamos del slug.
  const categoryName =
    lastSegment.charAt(0).toUpperCase() +
    lastSegment.slice(1).replace(/-/g, " ");

  return {
    title: `${categoryName} | Periódico Naranja`,
    description: `Noticias y artículos sobre ${categoryName}`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  // Validación básica
  if (!slug || slug.length === 0) {
    notFound(); // Lanza la página 404 de Next.js
  }


  const cleanSlug = slug[slug.length - 1].replace(/\.html$/, '');
  const lastSegment = cleanSlug;
  console.log("Dynamic Page Slug:", lastSegment);

  // 1. Intentamos buscar el Post
  const post = await fetchPost(lastSegment);

  if (post) {
    // CASO A: ES UN ARTÍCULO

    // Schema.org para NewsArticle
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": post.yoast_head_json?.title || post.title?.rendered,
      "image": [
        post.yoast_head_json?.og_image?.[0]?.url || post.jetpack_featured_media_url
      ],
      "datePublished": post.date,
      "dateModified": post.modified,
      "author": [{
        "@type": "Person",
        "name": post.yoast_head_json?.author || "Periodico Naranja",
        "url": `https://periodiconaranja.es/author/${post.yoast_head_json?.twitter_creator || ""}`
      }],
      "publisher": {
        "@type": "Organization",
        "name": "Periodico Naranja",
        "logo": {
          "@type": "ImageObject",
          "url": "https://periodiconaranja.es/Logo.png"
        }
      },
      "description": post.yoast_head_json?.description || post.excerpt?.rendered.replace(/<[^>]*>?/gm, "")
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Noticia_Precargada post={post as Post} cmsUrl={process.env.CMS_URL} />
      </>
    );
  }

  // CASO B: ES UNA CATEGORÍA (o no existe nada)
  // Schema.org para CollectionPage (Sección)
  const categoryName = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");

  const sectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": categoryName,
    "description": `Noticias y artículos sobre ${categoryName}`,
    "url": `https://periodiconaranja.es/${lastSegment}`,
    "publisher": {
      "@type": "Organization",
      "name": "Periodico Naranja"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sectionJsonLd) }}
      />
      <NoticiasPorCategoria slug={lastSegment} />
    </>
  );
}
