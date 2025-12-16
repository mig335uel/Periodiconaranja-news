//import NewsEditor from "@/components/TipTapEditor";

// import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/Types/Posts";
import Header from "@/app/Header";
import MainPage from "@/components/ui/MainPage";
import { buildCategoryPath } from "@/lib/utils";
import Link from "next/link";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/ui/HeroSlider";


function getExcerpt(html: string, length: number): string {
  const text = html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
  return text.length > length ? text.substring(0, length) + "..." : text;
}



async function fetchPosts(): Promise<Post[]> {
  const response = await fetch("https://periodiconaranja.es/wp-json/wp/v2/posts?per_page=25&_fields=id,date,slug,title,excerpt,author,featured_media,jetpack_featured_media_url,categories,_links,_embedded");
  const posts: Post[] = await response.json();
  return posts;
}

export default async function Home() {
  const posts: Post[] = await fetchPosts();
  const featuredPosts = posts.slice(0, 5);
  return (
    <>
      <MainPage />
    </>
      
  );
}
