"use client";

import { PostsNode } from "@/Types/Posts";
import './LiveNews.scss';
import { useState, useEffect } from "react";
import Link from "next/link";
import { buildCategoryNodePath } from "@/lib/utils";

export default function LiveNews({ posts }: { posts: PostsNode[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!posts || posts.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
        }, 10000); // 10 seconds to match the CSS animation duration

        return () => clearInterval(interval);
    }, [posts]);

    if (!posts || posts.length === 0) return null;
    
    return (
        <>
            <div className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-sm">
                <div className="bg-orange-500 rounded-sm text-white p-2 shrink-0 z-10">
                    <h2 className="text-md font-bold md:text-sm">En Directo</h2>
                </div>

                <div className="news-mask-container flex-1 mx-2">
                    <Link href={`/${buildCategoryNodePath(posts[currentIndex]?.categories.nodes)}/${posts[currentIndex]?.slug}`}>
                        <div key={currentIndex} className="scrolling-text">
                            {posts[currentIndex]?.title}
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}