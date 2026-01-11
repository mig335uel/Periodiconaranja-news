/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Header from "@/app/Header";
import { buildCategoryPath } from "@/lib/utils";
import { Post } from "@/Types/Posts";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NoticiasPorCategoria({ slug }: { slug: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsWidget, setPostsWidget] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  useEffect(() => {
    // Establecer la carga a true al inicio del efecto
    setLoading(true);

    const loadAllData = async () => {
      setLoading(true);
      try {
        // --- Petición 1: Categoría (información básica) ---
        const categoryPromise = fetch(`/api/categories/${slug}`);

        // --- Petición 2: Widgets (lo más leído, etc.) ---
        const widgetPromise = fetch("/api/post");

        // Guardamos todo en promesas iniciales
        const [categoryResponse, widgetResponse] = await Promise.all([
          categoryPromise,
          widgetPromise
        ]);

        // ... Procesar widgets (igual que antes) ...
        if (widgetResponse.ok) {
          const data2 = await widgetResponse.json();
          setPostsWidget(Array.isArray(data2) ? data2 : data2.post || []);
        }

        // --- LÓGICA DE BUCLE PARA TRAER TODAS LAS NOTICIAS ---
        // Solo necesitamos la info de la categoría una vez para saber si existe
        if (categoryResponse.ok) {
          let allPosts: Post[] = [];
          let currentPage = 1;
          let keepFetching = true;

          while (keepFetching) {
            // Hacemos la petición a tu API pasando la página
            // NOTA: Asegúrate de que tu route.ts maneje ?page=...
            const response = await fetch(`/api/categories/${slug}?page=${currentPage}`);

            if (!response.ok) break;

            const data = await response.json();
            const pagePosts = data.posts || [];

            if (pagePosts.length > 0) {
              allPosts = [...allPosts, ...pagePosts];
            }

            // CONDICIÓN DE PARADA:
            // Si recibimos menos de 100, es la última página.
            if (pagePosts.length < 100) {
              keepFetching = false;
            } else {
              currentPage++; // Vamos a por la siguiente
            }
          }

          setPosts(allPosts);
        }

      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [slug, page]);

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
                    key={post.id}
                    href={`/${buildCategoryPath(post.categories)}/${post.slug}`}
                    className="block border-b border-gray-100 last:border-0 p-3 hover:bg-orange-50 transition group"
                  >
                    <span className="text-xs text-orange-500 font-bold block mb-1">
                      {new Date(post.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <h3 className="font-medium text-sm leading-snug group-hover:text-orange-700 transition-colors">
                      <div dangerouslySetInnerHTML={{ __html: post.title.rendered }}></div>
                    </h3>
                  </Link>
                ))}
            </div>
          </aside>

          <main className="lg:col-span-6 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${buildCategoryPath(post.categories)}/${post.slug}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {post.jetpack_featured_media_url && (
                    <div className="overflow-hidden h-48 relative">
                      <img
                        src={post.jetpack_featured_media_url}
                        alt={post.title.rendered}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      <div dangerouslySetInnerHTML={{ __html: post.title.rendered }}></div>
                    </h3>
                    <div className="text-sm text-gray-600 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}></div>
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
              ))}
            </div>
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
                  .slice(-5)
                  .reverse()
                  .map((post, index) => (
                    <li key={post.id} className="relative">
                      <span className="absolute -left-[33px] top-0 w-8 h-8 bg-white border-2 border-orange-500 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {index + 1}
                      </span>
                      <Link
                        href={`/noticias/${post.slug}`}
                        className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition leading-snug block"
                      >
                        <div dangerouslySetInnerHTML={{ __html: post.title.rendered }}></div>
                      </Link>
                    </li>
                  ))}
              </ol>
            </div>

            {/* Banner Publicidad simulada */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-8 text-white text-center shadow-lg transform hover:-translate-y-1 transition-transform">
              <h4 className="font-bold text-2xl mb-2">Suscríbete</h4>
              <p className="text-orange-100 text-sm mb-6">
                Recibe el resumen diario cada mañana.
              </p>
              <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition w-full shadow-md">
                Apuntarme
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
