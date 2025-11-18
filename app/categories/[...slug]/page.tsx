
import type {Post} from "@/Types/Posts";
import {Metadata} from "next";

interface Props {
    params: {
        slug: string[]
    }
}



export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
    const slugPath = await params;

    return {
        title: slugPath.slug.join('/'),
        description: `Posts under the category: ${slugPath}`,
    };



}



export default async function Categories({ params }: Props) {

    const category = await params;

    const slug = category.slug.join('/');


    const postsforCategories: Post[] = await fetch(`/api/categories/${slug}`)
        .then(res => res.json())
        .then(data => data.posts)
        .catch(err => {
            console.error("Error fetching posts for category:", err);
            return [];
        });

    return (
        <div className="container mx-auto p-4">

        </div>
    );
}