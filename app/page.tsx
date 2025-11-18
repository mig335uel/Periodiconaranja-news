//import NewsEditor from "@/components/TipTapEditor";

import {createClient} from "@/lib/supabase/client";
import type {Post} from "@/Types/Posts";
import Header from "@/app/Header";
import MainPage from "@/components/ui/MainPage";

export default async function Home() {
    const supabase = await createClient();
    // @ts-ignore
    const {data, error} = await supabase.from('posts').select('*').limit(10).select;
    if(error){
        console.error("Error fetching posts:", error);
    }

    const posts: Post[] = data || [];

  return (
    <>
        <MainPage />

    </>
  );
}
