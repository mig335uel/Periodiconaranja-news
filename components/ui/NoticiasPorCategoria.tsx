/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Header from "@/app/Header";
import { buildCategoryNodePath, buildCategoryPath } from "@/lib/utils";
import { Post, PostsNode } from "@/Types/Posts";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../Footer";
import NotFound from "../NotFound";
import React from "react";
import AdBanner, { AdBanner2 } from "../AdBanner";

export default function NoticiasPorCategoria({ slug }: { slug: string }) {
  const [posts, setPosts] = useState<PostsNode[]>([]);
  const [postsWidget, setPostsWidget] = useState<PostsNode[]>([]);
  const [loading, setLoading] = useState(true);

  const [endCursor, setEndCursor] = useState<string | null>(null);

  const [hasMore, setHasMore] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "https://periodiconaranja.es";
  useEffect(() => {
    // Establecer la carga a true al inicio del efecto
    setLoading(true);



    const fetchCategoryData = async (cursor: string | null = null) => {
      const afterValue = cursor ? `"${cursor}"` : null;
      const query = `
        query GetCategoryPosts {
          category(id: "${slug}", idType: SLUG) {
            name
            databaseId
            slug
            posts(first: 10, after: ${afterValue}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                databaseId
                title
                excerpt
                slug
                date
                featuredImage {
                  node {
                    mediaItemUrl
                  }
                }
                categories {
                  nodes {
                    databaseId
                    name
                    slug
                  }
                }
              }
            }
          }
        }
      `;

      console.log("Fetching from:", `${CMS_URL}/graphql`);
      console.log("Query slug:", slug);

      try {
        const response = await fetch(`/api/categories/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        console.log("Response status:", response.status);
        const json = await response.json();
        console.log("Response JSON:", json);

        if (json.errors) {
          console.error("GraphQL Errors:", json.errors);
        }
        if (json?.data?.category === null) {
          setNotFound(true);
          return null;
        }
        return json?.data?.category?.posts;

      } catch (err) {
        console.error("Fetch error:", err);
        return null;
      }
    };

    const loadInitialData = async () => {
      setLoading(true);

      // 1. Fetch posts (GraphQL) - Prioridad alta
      try {
        const postsData = await fetchCategoryData(null);

        if (postsData) {
          setPosts(postsData.nodes);
          setEndCursor(postsData.pageInfo.endCursor);
          setHasMore(postsData.pageInfo.hasNextPage);
        }
      } catch (error) {
        console.error("Error al cargar noticias:", error);
      } finally {
        // Mostramos el contenido principal YA, sin esperar a los widgets
        setLoading(false);
      }

      // 2. Fetch widgets (REST - Legacy) - Prioridad baja (background)
      try {

        const query = `
        query getPosts{
          posts(first: 15) {
            nodes {
              databaseId
              title
              excerpt
              slug
              date
              featuredImage {
                node {
                  mediaItemUrl
                }
              }
              categories {
                nodes {
                  databaseId
                  name
                  slug
                }
              }
            }
          }
        }
      `;
        const widgetResponse = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (widgetResponse.ok) {
          const widgetData = await widgetResponse.json();
          setPostsWidget(widgetData?.data?.posts?.nodes || []);
        }
      } catch (error) {
        console.error("Error al cargar widgets:", error);
      }
    };

    loadInitialData();
  }, [slug]);

  const handleLoadMore = async () => {
    if (!endCursor || !hasMore) return;

    try {
      const query = `
        query GetCategoryPosts {
          category(id: "${slug}", idType: SLUG) {
            posts(first: 10, after: "${endCursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                databaseId
                title
                excerpt
                slug
                date
                featuredImage {
                  node {
                    mediaItemUrl
                  }
                }
                categories {
                  nodes {
                    databaseId
                    name
                    slug
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(`/api/categories/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      });

      const json = await response.json();
      const newPostsData = json?.data?.category?.posts;

      if (newPostsData) {
        setPosts((prev) => [...prev, ...newPostsData.nodes]);
        setEndCursor(newPostsData.pageInfo.endCursor);
        setHasMore(newPostsData.pageInfo.hasNextPage);
      }
    } catch (error) {
      console.error("Error al cargar más noticias:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </>
    );
  }
  if (notFound) {
    return <NotFound />;
  }


  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <div className="bg-orange-500 text-white px-4 py-2 font-bold text-lg uppercase tracking-wider">
              Última Hora
            </div>
            <div className="bg-white rounded shadow-sm border border-gray-100 p-2">
              {postsWidget
                .slice(-6)
                .reverse()
                .map((post) => (
                  <Link
                    key={post.databaseId}
                    href={`/${buildCategoryNodePath(post.categories.nodes)}/${post.slug}`}
                    className="block border-b border-gray-100 last:border-0 p-3 hover:bg-orange-50 transition group"
                  >
                    <span className="text-xs text-orange-500 font-bold block mb-1">
                      {new Date(post.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <h3 className="font-medium text-sm leading-snug group-hover:text-orange-700 transition-colors">
                      <div dangerouslySetInnerHTML={{ __html: post.title }}></div>
                    </h3>
                  </Link>
                ))}
            </div>
            <AdBanner />
          </aside>

          <main className="lg:col-span-6 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post, index) => (
                <React.Fragment key={post.databaseId}>
                  <Link
                    href={`/${buildCategoryNodePath(post.categories.nodes)}/${post.slug}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {post.featuredImage.node.mediaItemUrl && (
                      <div className="overflow-hidden h-48 relative">
                        <img
                          src={post.featuredImage.node.mediaItemUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        <div dangerouslySetInnerHTML={{ __html: post.title }}></div>
                      </h3>
                      <div className="text-sm text-gray-600 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.excerpt }}></div>
                      <div className="text-xs text-gray-400 flex justify-between items-center">
                        <span>
                          {new Date(post.date).toLocaleDateString("es-ES")}
                        </span>
                        <span className="text-orange-500 font-medium group-hover:translate-x-1 transition-transform">
                          Leer más →
                        </span>
                      </div>
                    </div>
                  </Link>
                  {(index + 1) % 2 === 0 && (
                    <div className="col-span-1 md:col-span-2 w-full flex-col items-center flex justify-center my-4">
                      {/* Anuncio 2 para escritorio y 1 para móvil */}
                      <div className="hidden md:flex w-full justify-center">
                        <AdBanner2 />
                      </div>
                      <div className="flex md:hidden w-full justify-center">
                        <AdBanner />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8 col-span-1 md:col-span-2">
                <button
                  onClick={handleLoadMore}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition shadow-md"
                >
                  Cargar más
                </button>
              </div>
            )}


          </main>
          <aside className="lg:col-span-3 space-y-8 order-3">
            {/* Widget Lo más leído */}
            <div className="bg-gray-50 rounded-lg p-6 border-t-4 border-orange-500 shadow-md">
              <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
                <span className="text-orange-500 text-2xl">★</span>
                Lo más leído
              </h3>
              <ol className="space-y-6 relative border-l-2 border-gray-200 ml-3 pl-6">
                {postsWidget
                  .slice(-6)
                  .reverse()
                  .map((post, index) => (
                    <li key={post.databaseId} className="relative">
                      <span className="absolute -left-[33px] top-0 w-8 h-8 bg-white border-2 border-orange-500 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {index + 1}
                      </span>
                      <Link
                        href={`/${buildCategoryNodePath(post.categories.nodes)}/${post.slug}`}
                        className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition leading-snug block"
                      >
                        <div dangerouslySetInnerHTML={{ __html: post.title }}></div>
                      </Link>
                    </li>
                  ))}
              </ol>
            </div>

            {/* Banner Publicidad simulada */}
            {/* <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-8 text-white text-center shadow-lg transform hover:-translate-y-1 transition-transform">
              <h4 className="font-bold text-2xl mb-2">Suscríbete</h4>
              <p className="text-orange-100 text-sm mb-6">
                Recibe el resumen diario cada mañana.
              </p>
              <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition w-full shadow-md">
                Apuntarme
              </button>
            </div> */}
            <AdBanner />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
