import type { Post } from "@/Types/Posts";
import Noticia from "@/components/ui/Noticia";
import { method } from "lodash";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: {
    slug: string;
  };
}

export async function fetchNoticia(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(
      `https://periodiconaranja.es/wp-json/wp/v2/posts?slug=${slug}&_embed`
    );
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Return first item, looking like a Post (roughly)
      // For metadata purposes, we mainly need title.rendered
      const post = data[0];
      return {
        ...post,
        title: post.title.rendered, // Adjust for metadata usage
        // Other fields might not be perfectly mapped for 'Post' interface type safety here
        // but usually sufficient for metadata which uses .title
      } as unknown as Post;
    }
    return null;
  } catch (e) {
    console.error("Error fetching noticia for metadata:", e);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slugPath = await params;
  const noticia = await fetchNoticia(slugPath.slug);
  return {
    title: noticia?.title,
    description: `Posts under the category: ${slugPath}`,
  };
}

export default async function Noticias({ params }: Props) {
  const category = await params;

  const slug = category.slug;

  return <Noticia slug={slug} />;
}
