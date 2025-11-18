"use client";
import { useEffect, useState } from 'react';

import type { Post } from '@/Types/Posts';
import Link from "next/link";
import './Noticia.scss'


export default function Noticia({slug}: {slug: string}) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchPost = async () => {
            try{
                const res = await fetch(`/api/post/${slug}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!res.ok) {
                    console.log(res.json());
                }
                const data = await res.json();
                setPost(data.post);
            }
            catch (err: unknown){
                const errorMessage = err instanceof Error ? err.message : "Error desconocido.";
                console.error("Error fetching post:", err);
                setError(errorMessage);
            }
            finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [slug]);

    const htmlWithBr = post ? post.content
        .replace(/\n+/g, '\n')          // varios saltos → uno solo
        .replace(/>\n+</g, '><') :  '' ;
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                        <p className="text-gray-600 mt-4">Cargando artículo...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 text-lg">{error || 'Post no encontrado'}</p>
                    <Link href="/" className="text-orange-600 hover:underline mt-4 inline-block">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Categorías */}
                {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {post.categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="inline-block bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide hover:bg-orange-700 transition no-underline"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Título del artículo */}
                <h1 className="font-serif text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                {/* Metadata: Autor y Fecha */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-6 border-b-2 border-orange-200">
                    {/* Autor */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Por</p>
                            <p className="font-semibold text-gray-900">
                                {post.author?.name || 'Redacción'} {post.author?.last_name || ''}
                            </p>
                        </div>
                    </div>

                    {/* Fecha de publicación */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Publicado</p>
                            <time dateTime={post.published_at} className="font-semibold text-gray-900">
                                {new Date(post.published_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </time>
                        </div>
                    </div>
                </div>

                {/* Imagen destacada */}
                {post.featured_image && (
                    <figure className="mb-10 -mx-4 md:mx-0">
                        <div className="rounded-none md:rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        {post.excerpt && (
                            <figcaption className="text-sm text-gray-600 italic mt-3 px-4 md:px-0">
                                {post.excerpt}
                            </figcaption>
                        )}
                    </figure>
                )}

                {/* Contenido del artículo */}
                <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                    <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n+/g, '')}}
                    ></div>
                </div>

                {/* Footer del artículo */}
                <div className="mt-10 pt-8 border-t-2 border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Compartir */}
                        <div className="flex items-center gap-3">
                            <span className="text-gray-600 font-semibold">Compartir:</span>
                            <button
                                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                                aria-label="Compartir en Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </button>
                            <button
                                className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition"
                                aria-label="Compartir en Twitter"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </button>
                            <button
                                className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition"
                                aria-label="Compartir en WhatsApp"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                            </button>
                        </div>

                        {/* Volver */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition no-underline"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}


