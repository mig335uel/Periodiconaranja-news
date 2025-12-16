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
      `https://periodiconaranja.es/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      { next: { revalidate: 60 } } // Opcional: caché de 60 segundos
    );
    if (!res.ok) return null;
    const posts = (await res.json()) as Post[];
    return posts.length > 0 ? posts[0] : null;
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
  const post = await fetchPost(lastSegment);

  if (post) {
    // Si es un post, devolvemos sus metadatos
    // Mapeamos los datos de Yoast a OpenGraph de Next.js
    return {
      title: post.yoast_head_json?.title || post.title.rendered,
      description: post.yoast_head_json?.description || post.excerpt.rendered.replace(/<[^>]*>?/gm, ''), // Limpiar HTML
      openGraph: {
        title: post.yoast_head_json?.og_title || post.title.rendered,
        description: post.yoast_head_json?.og_description,
        images: post.yoast_head_json?.og_image || [],
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.modified,
        authors: [post.yoast_head_json?.author || "Periodico Naranja"],
      },
    };
  }

  // 2. Si no es un post, asumimos que es una CATEGORÍA
  // Aquí podrías hacer un fetch a la API de categorías si quisieras el nombre real,
  // por ahora lo formateamos del slug.
  const categoryName = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  
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

  // El último segmento es la clave (o es el slug del post, o el de la categoría)
  const lastSegment = slug[slug.length - 1];

  // 1. Intentamos buscar el Post
  const post = await fetchPost(lastSegment);

  if (post) {
    // CASO A: ES UN ARTÍCULO
    const response = await fetch(
      `https://periodiconaranja.es/wp-json/wp/v2/posts/${post.id}?_embed`,
      { next: { revalidate: 60 } } // Opcional: caché de 60 segundos
    );
    const postData = await response.json();
    return <Noticia_Precargada post={postData} />;
  }

  // CASO B: ES UNA CATEGORÍA (o no existe nada)
  // Si no encontramos post, renderizamos la vista de categoría.
  // Nota: Si la categoría tampoco existe, NoticiasPorCategoria debería manejar el estado vacío o error.
  return <NoticiasPorCategoria slug={lastSegment} />;
}