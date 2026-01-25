"use client";

import Header from "@/app/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Post, Category, PostsNode } from "@/Types/Posts"; // Asegúrate de tener Category importado
import { CategoryNode } from "@/Types/Categories";
import { buildCategoryNodePath } from "@/lib/utils";

function SearchContent() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("s") || "";

  const [posts, setPosts] = useState<PostsNode[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [postsWidget, setPostsWidget] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Parseamos la query para saber qué limpiar y mostrar en el título
  const [cleanTerm, setCleanTerm] = useState("");

  useEffect(() => {
    if (!rawQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadData = async () => {
      try {
        let term = rawQuery.trim();
        let searchPosts = true;
        let searchCats = true;

        // --- 1. LÓGICA DE COMANDOS INTELIGENTES ---
        if (
          term.toLowerCase().startsWith("news:") ||
          term.toLowerCase().startsWith("noticia:")
        ) {
          term = term.replace(/^(news:|noticia:)/i, "").trim();
          searchCats = false;
        } else if (
          term.toLowerCase().startsWith("cat:") ||
          term.toLowerCase().startsWith("categoria:")
        ) {
          term = term.replace(/^(cat:|categoria:)/i, "").trim();
          searchPosts = false;
        }

        setCleanTerm(term);

        // --- 2. PREPARA LA QUERY DE GRAPHQL ---
        const query = `
          query Search($term: String!, $searchPosts: Boolean!, $searchCats: Boolean!) {
            posts(where: { search: $term, orderby:{field: DATE, order: DESC}}, first: 100) @include(if: $searchPosts) {
              nodes {
                databaseId
                slug
                title
                excerpt
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
            categories(where: { search: $term }, first: 5) @include(if: $searchCats) {
              nodes {
                databaseId
                name
                slug
                
              }
            }
          }
        `;

        // --- 3. EJECUTAMOS LAS PETICIONES (GraphQL + Widget) ---
        const promises = [];

        // Petición GraphQL Principal
        promises.push(
          fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query,
              variables: {
                term,
                searchPosts,
                searchCats,
              },
            }),
          }).then((res) => (res.ok ? res.json() : { data: {} }))
        );

        // Petición del Widget Lateral (se mantiene igual, u optimizar en futuro)
        promises.push(
          fetch("/api/post").then((res) => (res.ok ? res.json() : []))
        );

        const [graphqlResult, widgetData] = await Promise.all(promises);

        // --- 4. MAPEO DE DATOS ---

        // --- 4. MAPEO DE DATOS ---

        // Mapear Posts de GraphQL a la estructura que espera la UI (interfaz Post)
        const mappedPosts: PostsNode[] = (graphqlResult.data?.posts?.nodes || [])

        // Mapear Categorías
        const mappedCats: CategoryNode[] = (graphqlResult.data?.categories?.nodes || [])
          .filter((node: any) =>
            node.name.toLowerCase().includes(term.toLowerCase())
          );

        setPosts(mappedPosts);
        setCategories(mappedCats);
        setPostsWidget(Array.isArray(widgetData) ? widgetData : []);

      } catch (error) {
        console.error("Error buscando:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [rawQuery]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-500">Analizando archivos...</p>
        </div>
      </div>
    );
  }

  const hasResults = posts.length > 0 || categories.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabecera de Resultados */}
      <div className="mb-8 border-b-2 border-orange-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Resultados para:{" "}
          <span className="text-orange-600">"{cleanTerm}"</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Se encontraron {posts.length} artículos y {categories.length}{" "}
          categorías.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="lg:col-span-9 order-1">
          {hasResults ? (
            <div className="space-y-10">
              {/* 1. SECCIÓN DE CATEGORÍAS (Si existen) */}
              {categories.length > 0 && (
                <section>
                  <h2 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800">
                    <span className="bg-gray-100 p-2 rounded-lg text-orange-600">
                      📂
                    </span>
                    Secciones y Temas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat.databaseId}
                        href={`/categories/${cat.slug}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition bg-white group"
                      >
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 mb-1">
                          {cat.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ver noticias de esta sección →
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* 2. SECCIÓN DE NOTICIAS (Si existen) */}
              {posts.length > 0 && (
                <section>
                  {categories.length > 0 && (
                    <h2 className="font-bold text-xl mb-4 mt-8 text-gray-800">
                      📰 Artículos
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <Link
                        key={post.databaseId}
                        href={`/${buildCategoryNodePath(post.categories.nodes)}/${post.slug}`}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                      >
                        <div className="overflow-hidden h-48 relative bg-gray-100">
                          {post.featuredImage?.node?.mediaItemUrl ? (
                            <img
                              src={post.featuredImage.node.mediaItemUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (post as any)._embedded?.["wp:featuredmedia"]?.[0]
                            ?.source_url ? (
                            <img
                              src={
                                (post as any)._embedded["wp:featuredmedia"][0]
                                  .source_url
                              }
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              <span className="text-4xl">📰</span>
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                          <h3
                            className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-3"
                            dangerouslySetInnerHTML={{
                              __html: post.title,
                            }}
                          />

                          <div className="mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400 flex justify-between items-center">
                            <span>
                              {new Date(post.date).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-orange-500 font-medium group-hover:translate-x-1 transition-transform">
                              Leer más →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            // ESTADO VACÍO
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-10 text-center">
              <p className="text-xl text-gray-600 mb-4">
                No hemos encontrado nada para "<strong>{cleanTerm}</strong>".
              </p>
              <p className="text-gray-500 mb-6">
                Prueba a buscar otra cosa o revisa la ortografía.
              </p>
            </div>
          )}
        </main>

        {/* --- SIDEBAR DERECHO --- */}
        <aside className="lg:col-span-3 space-y-8 order-2">
          <div className="bg-gray-50 rounded-lg p-6 border-t-4 border-orange-500 shadow-md">
            <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
              <span className="text-orange-500 text-2xl">★</span>
              Lo más leído
            </h3>
            <ol className="space-y-6 relative border-l-2 border-gray-200 ml-3 pl-6">
              {postsWidget.slice(0, 5).map((post, index) => (
                <li key={post.id} className="relative">
                  <span className="absolute -left-[33px] top-0 w-8 h-8 bg-white border-2 border-orange-500 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    {index + 1}
                  </span>
                  <Link
                    href={`/noticias/${post.slug}`}
                    className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition leading-snug block"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function BusquedaPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={<div className="text-center py-20">Cargando buscador...</div>}
      >
        <SearchContent />
      </Suspense>
      <Footer />
    </>
  );
}
