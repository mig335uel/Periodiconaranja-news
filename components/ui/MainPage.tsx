"use client";






import Link from "next/link";
import {Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, useState, useEffect} from "react";
import type {Post} from "@/Types/Posts";
import Header from "@/app/Header";
export default function MainPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (featuredPosts.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.min(5, featuredPosts.length));
        }, 5000); // cambia cada 5 segundos
        return () => clearInterval(interval);
    }, [featuredPosts]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/post', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                // Filtrar solo posts publicados

                setPosts(data.post);
                setFeaturedPosts(data.post.slice(0, 5));
            } catch (error) {
                console.error('Error al cargar posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const getExcerpt = (content: string, maxLength: number = 150) => {
        // 1️⃣ Quitar todas las etiquetas HTML
        let text = content.replace(/<[^>]*>/g, '');

        // 2️⃣ Reemplazar tabuladores, retornos de carro y saltos de línea por un solo espacio
        text = text.replace(/[\r\n\t]+/g, ' ');

        // 3️⃣ Reducir múltiples espacios a uno solo
        text = text.replace(/\s+/g, ' ').trim();

        // 4️⃣ Truncar si excede maxLength
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <p className="text-center text-gray-500">Cargando noticias...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            {/* Cabecera del periódico */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-4 border-orange-500">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="text-sm text-gray-600">
                            Edición Digital
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Layout principal: estilo periódico */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Columna izquierda: Noticias secundarias */}
                    <aside className="lg:col-span-3 space-y-4">
                        <div className="bg-orange-500 text-white px-4 py-2 font-bold text-lg">
                            ÚLTIMAS NOTICIAS
                        </div>
                        {posts.slice(0, 5).map((post) => (
                            <Link
                                key={post.id}
                                href={`/noticias/${post.slug}`}
                                className="block border-b border-gray-300 pb-4 hover:bg-gray-50 transition"
                            >
                                {post.featured_image && (
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                )}
                                <h3 className="font-bold text-sm leading-tight hover:text-orange-600 transition">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(post.published_at).toLocaleDateString('es-ES')}
                                </p>
                            </Link>
                        ))}
                    </aside>

                    {/* Columna central: Noticia principal + carousel */}
                    <main className="lg:col-span-6">
                        {/* Carousel de noticias destacadas */}
                        {featuredPosts.length > 0 && (
                            <div
                                className="relative w-full h-96 mb-8 overflow-hidden rounded-lg shadow-2xl border-4 border-gray-200">
                                {featuredPosts.map((post, index) => (
                                    <Link
                                        key={post.id}
                                        href={`/noticias/${post.slug}`}
                                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                            }`}
                                    >
                                        <img
                                            src={post.featured_image || 'https://via.placeholder.com/800x400'}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                                            <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded mb-2">
                                                DESTACADO
                                            </span>
                                            <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-2">
                                                {post.title}
                                            </h2>
                                            <p className="text-gray-200 text-sm">
                                                {getExcerpt(post.excerpt!, 240)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}

                                {/* Indicadores del carousel */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                    {featuredPosts.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`w-2 h-2 rounded-full transition ${index === currentIndex ? 'bg-orange-500 w-8' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Grid de noticias */}
                        <div className="border-t-4 border-orange-500 pt-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-8 bg-orange-500"></span>
                                MÁS NOTICIAS
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {posts.slice(10, 18).map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/noticias/${post.slug}`}
                                        className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                                    >
                                        {post.featured_image && (
                                            <div className="overflow-hidden">
                                                <img
                                                    src={post.featured_image}
                                                    alt={post.title}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {getExcerpt(post.content, 100)}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{new Date(post.published_at).toLocaleDateString('es-ES')}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Columna derecha: Sidebar */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Widget de destacados */}
                        <div className="bg-gray-100 rounded-lg p-4 border-l-4 border-orange-500">
                            <h3 className="font-bold text-lg mb-4 text-orange-600">
                                LO MÁS LEÍDO
                            </h3>
                            <ol className="space-y-3">
                                {posts.slice(0, 5).map((post: {
                                    id: Key | null | undefined;
                                    slug: string;
                                    title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
                                }, index: number) => (
                                    <li key={post.id} className="flex gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <Link
                                            href={`/noticias/${post.slug}`}
                                            className="text-sm font-medium hover:text-orange-600 transition leading-tight"
                                        >
                                            {post.title}
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Banner/Ad space */}
                        {/* <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white text-center">
              <h4 className="font-bold text-xl mb-2">
                Suscríbete al Newsletter
              </h4>
              <p className="text-sm mb-4">
                Recibe las noticias más importantes
              </p>
              <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition">
                Suscribirse
              </button>
            </div> */}
                    </aside>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-16 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm">
                        © {new Date().getFullYear()} Periódico Naranja. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </>
    );
}