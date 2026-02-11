"use client"


import Link from "next/link";
import { useState, useEffect } from "react";
import { PostsNode } from "@/Types/Posts";
import { buildCategoryNodePath } from "@/lib/utils";
import Header from "@/app/Header";

interface ContactoProps {
    nombre: string;
    email: string;
    mensaje: string;
}

export default function Contacto() {

    const [formulario, setFormulario] = useState<ContactoProps>({
        nombre: "",
        email: "",
        mensaje: "",
    });

    const [posts, setPosts] = useState<PostsNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const query = `
    query GetPosts {
      posts(first: 10) {
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

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await fetch("/api/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            setPosts(data.data.posts.nodes);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <>
                <div className="container mx-auto px-4 py-20 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            </>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormulario((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSending(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formulario),
            });

            if (response.ok) {
                alert('Mensaje enviado correctamente');
                setFormulario({ nombre: "", email: "", mensaje: "" });
            } else {
                alert('Error al enviar el mensaje');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
                    <div className="bg-orange-500 text-white px-4 py-2 font-bold text-lg uppercase tracking-wider">
                        Últimas Noticias
                    </div>
                    <div className="bg-white rounded shadow-sm border border-gray-100 p-2">
                        {posts.slice(0, 6).map((post) => (
                            <Link
                                key={post.databaseId}
                                href={`/${buildCategoryNodePath(post.categories.nodes)}/${post.slug}`}
                                className="block border-b border-gray-100 last:border-0 p-3 hover:bg-orange-50 transition group"
                            >
                                <span className="text-xs text-orange-500 font-bold block mb-1">
                                    {new Date(post.date).toLocaleTimeString("es-ES", {
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
                </aside>
                <main className="lg:col-span-6 order-1 lg:order-2">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-orange-50 to-white">
                            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-3">Contacto</h1>
                            <p className="text-gray-600 leading-relaxed">
                                ¿Tienes alguna noticia, sugerencia o corrección? Nos encantaría escucharte.
                                Rellena el formulario y nos pondremos en contacto contigo lo antes posible.
                            </p>
                            <p className="text-gray-600 leading-relaxed"><strong>Email:</strong> contacto@periodiconaranja.es</p>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="nombre" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formulario.nombre}
                                            onChange={handleChange}
                                            placeholder="Tu nombre completo"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formulario.email}
                                            onChange={handleChange}
                                            placeholder="tucorreo@ejemplo.com"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="mensaje" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mensaje</label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        value={formulario.mensaje}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Escribe tu mensaje aquí..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white resize-none placeholder-gray-400"
                                        required
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className={`w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>{sending ? 'Enviando...' : 'Enviar Mensaje'}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
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
                            {posts.slice(0, 5).map((post, index) => (
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
                </aside>
            </div>
        </div>

    );
}