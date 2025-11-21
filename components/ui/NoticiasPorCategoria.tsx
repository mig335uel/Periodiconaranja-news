"use client"

import Header from "@/app/Header";
import { Post } from "@/Types/Posts";
import Link from "next/link";
import { useEffect, useState } from "react";







export default function NoticiasPorCategoria({ postsparams }: { postsparams: Post[] }) {

    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        console.log(postsparams);
        setPosts(postsparams);
    }, [postsparams]);


    return (
        <>
            <Header />

            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.isArray(posts) && posts.reverse().map((post) => (
                        <Link
                            key={post.id}
                            href={`/noticias/${post.slug}`}
                            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {post.featured_image && (
                                <div className="overflow-hidden md:h-96 h-48 relative">
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                </p>
                                <div className="text-xs text-gray-400 flex justify-between items-center">
                                    <span>{new Date(post.published_at).toLocaleDateString('es-ES')}</span>
                                    <span className="text-orange-500 font-medium group-hover:translate-x-1 transition-transform">Leer más →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </>

    )
}