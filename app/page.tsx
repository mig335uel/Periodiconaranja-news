//import NewsEditor from "@/components/TipTapEditor";

import {createClient} from "@/lib/supabase/client";
import type {Post} from "@/Types/Posts";
import Header from "@/app/Header";
import MainPage from "@/components/ui/MainPage";

export default async function Home() {
  const response = await fetch("https://periodiconaranja.es/wp-json/wp/v2/posts?_embed", { next: { revalidate: 300 } });
  const posts: Post[] = await response.json();
  return (
    <>
        <MainPage posts ={posts}/>

    </>
  );
}
