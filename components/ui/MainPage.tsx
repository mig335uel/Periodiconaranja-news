/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/app/Header";
// Importamos el nuevo componente Slider
import HeroSlider from "@/components/ui/HeroSlider";
import Footer from "../Footer";
import type { Post } from "@/Types/Posts";
import { buildCategoryPath } from "@/lib/utils";

export default function MainPage({ posts }: { posts: Post[] }) {

  // const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  // const [loading, setLoading] = useState(true);

  // NOTA: Hemos eliminado el useEffect del setInterval porque Swiper lo hace solo.

  /*useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/post", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        // La API /api/post ahora devuelve Post[] directamente
        if (Array.isArray(data)) {
          setPosts(data);
          setFeaturedPosts(data.slice(0, 6)); // Asumiendo que los primeros son los más recientes/destacados
        } else if (data.post && Array.isArray(data.post)) {
          // Fallback por si acaso
          setPosts(data.post);
          setFeaturedPosts(data.post.slice(0, 6));
        }
      } catch (error) {
        console.error("Error al cargar posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);*/

  const getExcerpt = (content: string, maxLength: number = 150) => {
    let text = content.replace(/<[^>]*>/g, "");
    text = text.replace(/[\r\n\t]+/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  /*if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </>
    );
  }*/
  const featuredPosts = posts.slice(0, 6);
  return (
    <>
      <Header />

      {/* Cabecera del periódico */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-4 border-orange-500 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-gray-700 font-serif">
            <div className="text-sm">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-sm font-bold tracking-widest uppercase">
              Edición Digital
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna izquierda: Listado rápido */}
          <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <div className="bg-orange-500 text-white px-4 py-2 font-bold text-lg uppercase tracking-wider">
              Últimas Noticias
            </div>
            <div className="bg-white rounded shadow-sm border border-gray-100 p-2">
              {posts.slice(0, 6).map((post) => (
                <Link
                  key={post.id}
                  href={`/noticias/${post.slug}`}
                  className="block border-b border-gray-100 last:border-0 p-3 hover:bg-orange-50 transition group"
                >
                  <span className="text-xs text-orange-500 font-bold block mb-1">
                    {new Date(post.date).toLocaleTimeString("es-ES", {
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

          {/* Columna central: Slider y Noticias Principales */}
          <main className="lg:col-span-6 order-1 lg:order-2">
            {/* === AQUI ESTA EL NUEVO SLIDER === */}
            {featuredPosts.length > 0 ? (
              <HeroSlider posts={featuredPosts} />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">
                No hay noticias destacadas
              </div>
            )}
            {/* ================================= */}

            {/* Sección de más noticias debajo del slider */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b-2 border-orange-100 pb-2">
                <span className="w-2 h-8 bg-orange-500 rounded-sm"></span>
                Actualidad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.slice(0, 6).map((post) => (
                  <Link
                    key={post.id}
                    href={`/${buildCategoryPath(post.categories)}/${post.slug}.html`}
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
            </div>
          </main>

          {/* Columna derecha: Lo más leído / Sidebar */}
          <aside className="lg:col-span-3 space-y-8 order-3">
            {/* Widget Lo más leído */}
            <div className="bg-gray-50 rounded-lg p-6 border-t-4 border-orange-500 shadow-md">
              <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
                <span className="text-orange-500 text-2xl">★</span>
                Lo más leído
              </h3>
              <ol className="space-y-6 relative border-l-2 border-gray-200 ml-3 pl-6">
                {posts.slice(0, 5).map((post, index) => (
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

      {/* Footer */}
      <Footer />
    </>
  );
}
