"use client";
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { use, useEffect, useMemo, useState, useCallback } from 'react'; // <-- Importar useCallback
import type { Post } from '@/Types/Posts';
import Link from "next/link";
import './Noticia.scss';
import ComentariosEditor from "@/components/ComentariosEditor";
import Header from '@/app/Header';
import type { Comentarios } from '@/Types/Comments';
import { useAuth } from '@/hooks/useAuth';

// Componente CommentTree modificado
function CommentTree({ comments, onReply, onDelete }: { comments: Comentarios[], onReply: (commentId: string) => void, onDelete: (commentId: string) => void }) {
    // 1. PROTECCIÓN: Si comments es undefined o null, no renderizamos nada para evitar errores.
    const { user } = useAuth();
    if (!comments || comments.length === 0) return null;
    return (
        <div className="comment-tree space-y-4"> {/* space-y-4 añade separación entre comentarios raíz */}
            {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-100 last:border-0 py-4 ">
                    <div className="flex justify-between items-start gap-4 comment-div"> {/* gap-4 evita que el botón pegue con el texto */}
                        <div className="flex-1 ">
                            {/* Nombre del comentarista (si no está autenticado, usar anonymous_name) */}
                            {comment.user?.image && comment.user?.image !== 'NULL' && comment.user?.image !== 'null' ? (
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-6 h-6 rounded-full relative flex items-center justify-center">
                                        <img src={comment.user?.image} className="w-6 h-6 object-cover rounded-full" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {comment.anonymous_name || (comment.user ? `${comment.user.name} ${comment.user.last_name}` : (comment.user_id ? "Usuario Registrado" : "Anónimo"))}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm font-semibold text-gray-700">
                                    {comment.anonymous_name || (comment.user ? `${comment.user.name} ${comment.user.last_name}` : (comment.user_id ? "Usuario Registrado" : "Anónimo"))}
                                </p>
                            )}

                            <p className="text-gray-800 mb-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
                            <p className="text-xs text-orange-500">
                                {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        {
                            // Lógica de visualización de botones Responder/Eliminar
                            (user !== null && (user.role === 'admin' || user.role === 'editor' || user.id === comment.user_id)) ? (
                                <div className="buttomComments flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => onReply(comment.id)}
                                        className="shrink-0 px-3 py-1 text-sm text-blue-600 rounded transition font-medium hover:bg-blue-600 hover:text-white border border-blue-600"
                                    >
                                        Responder
                                    </button>
                                    <button
                                        type="button"
                                        // CORREGIDO: Llama a onDelete(comment.id) directamente.
                                        onClick={() => onDelete(comment.id)}
                                        className="shrink-0 px-3 py-1 text-sm text-red-600 rounded transition font-medium hover:bg-red-600 hover:text-white border border-red-600"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onReply(comment.id)}
                                    className="shrink-0 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition font-medium"
                                >
                                    Responder
                                </button>
                            )
                        }

                    </div>

                    {/* Si hay respuestas, mostrarlas anidadas */}
                    {comment.replies && comment.replies.length > 0 && (
                        // 2. RESPONSIVE: Usamos pl-3 en móvil y md:pl-6 en PC para no perder espacio en pantallas pequeñas
                        <div className="ml-2 mt-3 pl-3 md:ml-6 md:pl-4 border-l-2 border-orange-200">
                            {/* PASAR onDelete en la llamada recursiva */}
                            <CommentTree comments={comment.replies} onReply={onReply} onDelete={onDelete} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Función auxiliar para convertir lista plana a árbol
const buildCommentTree = (flatComments: Comentarios[] | null | undefined) => {
    // Protección adicional para garantizar que el argumento sea un array
    const safeComments = Array.isArray(flatComments) ? flatComments : [];

    const map = new Map();
    const roots: any[] = [];

    // 1. Inicializar mapa y array de respuestas
    safeComments.forEach((comment) => {
        // Creamos una copia y añadimos 'replies' vacío
        map.set(comment.id, { ...comment, replies: [] });
    });

    // 2. Construir relaciones
    safeComments.forEach((comment) => {
        const node = map.get(comment.id);
        if (comment.parent_id) {
            const parent = map.get(comment.parent_id);
            // Solo añadimos si el padre existe (para evitar errores con datos huérfanos)
            if (parent) {
                parent.replies.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    // Opcional: Ordenar por fecha (más nuevos primero o al revés)
    return roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export default function Noticia({ slug }: { slug: string }) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comentarios, setComentarios] = useState<Comentarios[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    // useMemo depende de comentarios, se actualizará al cambiar el estado de los comentarios
    const comentariosArbol = useMemo(() => {
        return buildCommentTree(comentarios);
    }, [comentarios]);

    // Función para manejar la respuesta
    const handleReply = useCallback((commentId: string) => {
        setReplyingTo(commentId);
        // Scroll suave al editor de comentarios
        setTimeout(() => {
            document.getElementById('comment-editor')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }, [setReplyingTo]); // Dependencias vacías

    // 1. Función de fetcheo de comentarios (usa useCallback)
    const fetchComentarios = useCallback(async (postId: string) => {
        if (!postId) return;
        try {
            const res = await fetch(`/api/comentarios/${postId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.ok) {
                // CORREGIDO: Se lee el JSON una sola vez
                const data = await res.json();

                setComentarios(data);
            } else {
                console.error("Error fetching comentarios, status:", res.status);
            }
        } catch (err: unknown) {
            console.error("Error fetching comentarios:", err);
        }
    }, [setComentarios]); // Depende de setComentarios

    // 2. Función de eliminación (usa useCallback, resuelve el problema de borrado y recarga)
    const handleDelete = useCallback(async (commentId: string) => {
        // Aseguramos que tenemos el ID del post para la recarga posterior
        if (!post?.id) {
            console.error("No se pudo obtener el ID del post para recargar.");
            return;
        }

        try {
            const res = await fetch(`/api/comentarios/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                // ¡BORRADO EXITOSO!
                console.log('Comentario borrado con éxito. Recargando lista...');
                await fetchComentarios(post?.id)

            } else {
                const errorData = await res.json();
                console.error('Error al borrar el comentario:', errorData);
            }
        } catch (e: unknown) {
            console.error('Error durante el proceso de borrado:', e);
        }
    }, [post, fetchComentarios]); // Depende de post y fetchComentarios

    // Función para cancelar respuesta
    const handleCancelReply = useCallback(() => {
        setReplyingTo(null);
    }, []);

    // Función para cuando se envía un comentario (para limpiar el estado de respuesta y recargar)
    const handleCommentSubmitted = useCallback(() => {
        setReplyingTo(null);
        // Recargar comentarios si es necesario
        if (post?.id) {
            fetchComentarios(post.id);
        }
    }, [post, fetchComentarios]);


    // CORRECCIÓN DEL BUCLE y MANEJO DE LÓGICA DE FETCH
    useEffect(() => {
        const fetchPostAndComments = async () => {
            let fetchedPostId: string | undefined;

            try {
                const res = await fetch(`/api/post/${slug}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                let data;
                if (!res.ok) {
                    // Manejo del error: lee el cuerpo una vez y propaga el error.
                    // Leer el cuerpo una vez
                    const errorDetails = await res.json();
                    console.error("Error en fetchPost, respuesta no OK:", errorDetails);
                    throw new Error(errorDetails.message || `Error ${res.status}`);
                }

                // Lee el cuerpo JSON una sola vez (si res.ok fue true)
                data = await res.json();

                setPost(data.post);
                fetchedPostId = data.post?.id; // Capturar el ID

            }
            catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Error desconocido.";
                console.error("Error fetching post:", err);
                setError(errorMessage);
            }
            finally {
                setLoading(false);
            }

            // Llama a fetchComentarios AQUÍ, después de obtener el ID.
            if (fetchedPostId) {
                await fetchComentarios(fetchedPostId);
            }
        }

        fetchPostAndComments();

    }, [slug, fetchComentarios]); // Depende de slug y fetchComentarios

    const htmlWithBr = post ? post.content
        .replace(/\n+/g, '\n')
        .replace(/>\n+</g, '><') : '';

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
        <>
            <Header />
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

                            {post.author?.image && post.author?.image !== 'NULL' && post.author?.image !== 'null' ? (
                                <div className="w-12 h-12 rounded-full relative flex items-center justify-center">
                                    <img src={post.author?.image} className="w-12 h-12 object-cover rounded-full" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}


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
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n+/g, '') }}
                        ></div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Comentarios ({comentariosArbol.length})</h2>
                            <CommentTree
                                comments={comentariosArbol}
                                onReply={handleReply}
                                onDelete={handleDelete} // <-- Pasamos handleDelete como prop
                            />
                        </div>

                        <div className="mt-12 border-t pt-6" id="comment-editor">
                            <h3 className="text-xl font-semibold mb-4">
                                {replyingTo ? 'Respondiendo al comentario...' : 'Publica tu Comentario'}
                            </h3>

                            {/* Banner indicador cuando se está respondiendo */}
                            {replyingTo && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex justify-between items-center">
                                    <span className="text-blue-700 text-sm">
                                        Estás respondiendo a un comentario.
                                    </span>
                                    <button
                                        onClick={handleCancelReply}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Cancelar respuesta
                                    </button>
                                </div>
                            )}

                            <ComentariosEditor
                                postId={post.id}
                                parentID={replyingTo}
                                onCommentSubmitted={handleCommentSubmitted}
                            />
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}