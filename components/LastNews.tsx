"use client"
import { PostsNode } from "@/Types/Posts";

import "./LiveNews.scss";
import Link from "next/link";
import { buildCategoryNodePath } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function LastNews() {
    const [posts, setPosts] = useState<PostsNode[]>([]);
    const query = `query NewQuery {
    posts(where: {
        isBreaking: true
    }){
        nodes {
        databaseId
        title
        slug
        isBreaking
        date
        featuredImage {
            node {
            sourceUrl
            }
        }
        categories {
            nodes {
            name
            slug
            databaseId
            }
        }
        }
    }
    }`;


    const fetchBreakingNews = async () => {
        const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            next: {
                revalidate: 60,
            },
            body: JSON.stringify({
                query
            }),
        });
        const data = await response.json();

        if (data.data?.posts?.nodes) {
            const breakingNews = data.data.posts.nodes.filter((post: any) => post.isBreaking);
            setPosts(breakingNews);
        } else {
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchBreakingNews();

        const interval = setInterval(() => {
            fetchBreakingNews();
        }, 10000); // 10 seconds to match the CSS animation duration

        return () => clearInterval(interval);
    }, []);

    if (posts.length === 0 || !posts) {
        return <></>;
    }
    return (
        <>
            <div className="flex flex-wrap items-center justify-between p-2 bg-gray-100 rounded-sm">
                <div className="bg-orange-500 rounded-sm text-white p-2 shrink-0 z-10">
                    <h2 className="text-md font-bold md:text-sm">Última Hora</h2>
                </div>
                {posts.length > 0 && posts.map((post, index) => (
                    <div key={post.databaseId} className="news-mask-container flex-1 mx-2">
                        <Link href={`/${buildCategoryNodePath(post.categories.nodes)}/${post.slug}`}>
                            <div className="scrolling-text">
                                {post.title}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </>
    );
}
