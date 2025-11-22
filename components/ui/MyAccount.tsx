"use client"
import Header from "@/app/Header";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useAuth } from "@/hooks/useAuth";
import { Post } from "@/Types/Posts";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../Footer";
import path from "path";









export default function MiCuenta() {
    const { user } = useAuth();
    const [post, setPost] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/post', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                // Aseguramos que data.post sea un array
                if (data.post && Array.isArray(data.post)) {
                    setPost(data.post);
                }
            } catch (error) {
                console.error('Error al cargar posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

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
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-4 border-orange-500 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between text-gray-700 font-serif">
                        <div className="text-sm">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="text-sm font-bold tracking-widest uppercase">
                            Edición Digital
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
                        <div className="bg-orange-500 text-white px-4 py-2 font-bold text-lg uppercase tracking-wider">
                            Última Hora
                        </div>
                        <div className="bg-white rounded shadow-sm border border-gray-100 p-2">
                            {post.slice(-6).reverse().map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/noticias/${post.slug}`}
                                    className="block border-b border-gray-100 last:border-0 p-3 hover:bg-orange-50 transition group"
                                >
                                    <span className="text-xs text-orange-500 font-bold block mb-1">
                                        {new Date(post.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <h3 className="font-medium text-sm leading-snug group-hover:text-orange-700 transition-colors">
                                        {post.title}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </aside>
                    <main className="lg:col-span-6 order-1 lg:order-2">
                        <div className="flex flex-col items-center justify-between text-gray-700 font-serif">
                            <div className="flex flex-row items-center gap-2">
                                {user?.image && user.image !== 'NULL' && user.image !== 'null' ? (
                                    <div>
                                        <img src={user?.image} className="w-12 h-12 rounded-full" />
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 rounded-full bg-orange-300 flex items-center justify-center">
                                        <svg className="w-24 h-24 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>

                                )}


                            </div>
                            <br/>
                            <div className="flex flex-col items-center gap-2">
                                <h2 className="font-bold text-[48px] text-center">{user?.name + ' ' + user?.last_name}</h2>
                                <p className="text-[24px] text-center">{user?.email}</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <button className="bg-orange-500 text-white px-4 py-2 font-bold text-lg uppercase tracking-wider">
                                    Editar Cuenta
                                </button>
                            </div>

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
                                {post.slice(-5).reverse().map((post, index) => (
                                    <li key={post.id} className="relative">
                                        <span className="absolute -left-[33px] top-0 w-8 h-8 bg-white border-2 border-orange-500 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                                            {index + 1}
                                        </span>
                                        <Link
                                            href={`/noticias/${post.slug}`}
                                            className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition leading-snug block"
                                        >
                                            {post.title}
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Banner Publicidad simulada */}
                        {/* <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-8 text-white text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                            <h4 className="font-bold text-2xl mb-2">Suscríbete</h4>
                            <p className="text-orange-100 text-sm mb-6">Recibe el resumen diario cada mañana.</p>
                            <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition w-full shadow-md">
                                Apuntarme
                            </button>
                        </div> */}
                    </aside>
                </div>
            </div>
            <Footer />
        </>
    );


}