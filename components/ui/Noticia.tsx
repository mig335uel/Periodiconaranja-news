"use client";
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import type { Post } from '@/Types/Posts';
import Link from "next/link";
import './Noticia.scss';
import ComentariosEditor from "@/components/ComentariosEditor";
import Header from '@/app/Header';
import type { Comentarios } from '@/Types/Comments';
import { useAuth } from '@/hooks/useAuth';

// Componente CommentTree modificado
function CommentTree({ comments, onReply }: { comments: Comentarios[], onReply: (commentId: string) => void}) {
    // 1. PROTECCIÓN: Si comments es undefined o null, no renderizamos nada para evitar errores.
    const { user } = useAuth();
    if (!comments || comments.length === 0) return null;


    const deleteComment = async(comment_id: string)=>{
        try {
            const res = await fetch(`/api/comentarios/${comment_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                // ¡ELIMINADO! En lugar de recargar la página:
                console.log('Comentario borrado con éxito. Recargando lista...');

                // Llama a la función que va a buscar la nueva lista de comentarios al servidor.
                // Esto actualiza el estado 'comentarios' y fuerza la re-renderización del CommentTree.
                await fetchComentarios(post.id);

            } else {
                const errorData = await res.json();
                console.error('Error al borrar el comentario:', errorData);
                // Mostrar un mensaje de error al usuario si la eliminación falló
            }
        } catch (e: unknown) {
            console.error('Error durante el proceso de borrado:', e);
        }
    }
    return (
        <div className="comment-tree space-y-4"> {/* space-y-4 añade separación entre comentarios raíz */}
            {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 last:border-0 py-4">
                    <div className="flex justify-between items-start gap-4"> {/* gap-4 evita que el botón pegue con el texto */}
                        <div className="flex-1">
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
                            (user !== null && (user.role === 'admin' || user.role === 'editor' || user.id === comment.user_id)) ? (
                                <div className="buttomComments">
                                    <button
                                        type="button"
                                        onClick={() => onReply(comment.id)}
                                        className="shrink-0 px-3 py-1 text-sm text-blue-600 rounded transition font-medium hover:bg-blue-600 hover:text-white"
                                    >
                                        Responder
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => () => deleteComment(comment.id)}
                                        className="shrink-0 px-3 py-1 text-sm text-red-600 rounded transition font-medium hover:bg-red-600 hover:text-white"
                                    >
                                        Eliminar
                                    </button>

                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={()=>onReply(comment.id)}
                                    className="shrink-0 px-3 py-1 text-sm text-blue-600 rounded transition font-medium  hover:bg-blue-600 hover:text-white"
                                >
                                    Responder
                                </button>
                            )
                        }

                    </div>

                    {/* Si hay respuestas, mostrarlas anidadas */}
                    {comment.replies && comment.replies.length > 0 && (
                        // 2. RESPONSIVE: Usamos pl-3 en móvil y md:pl-6 en PC para no perder espacio en pantallas pequeñas
                        <div className="ml-2 mt-3 pl-3 md:ml-6 md:pl-4 border rounded-md p-2 border-orange-200">
                            <CommentTree comments={comment.replies} onReply={onReply}/>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
// Función auxiliar para convertir lista plana a árbol
const buildCommentTree = (flatComments: Comentarios[] | null | undefined) => {
    // MODIFICACIÓN CLAVE: Si flatComments no es un array, usa un array vacío.
    const safeComments = Array.isArray(flatComments) ? flatComments : [];

    const map = new Map();
    const roots: any[] = [];

    // 1. Inicializar mapa y array de respuestas
    // Ahora usamos safeComments, que garantizamos que es un array.
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
    const comentariosArbol = useMemo(() => {
        return buildCommentTree(comentarios);
    }, [comentarios]);
    // Función para manejar la respuesta
    const handleReply = (commentId: string) => {
        console.log(commentId);
        setReplyingTo(commentId);
        // Scroll suave al editor de comentarios
        setTimeout(() => {
            document.getElementById('comment-editor')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    };
    const fetchComentarios = useCallback(async(id?: string) => {
        try {
            const res = await fetch(`/api/comentarios/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setComentarios(data);
            }
        } catch (err: unknown) {
            console.error("Error fetching comentarios:", err);
        }
    },[]);
    // Función para cancelar respuesta
    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    // Función para cuando se envía un comentario (para limpiar el estado de respuesta)
    const handleCommentSubmitted = () => {
        setReplyingTo(null);
        // Recargar comentarios si es necesario
        fetchComentarios();
    };



    useEffect(() => {
        const fetchPost = async () => {
            try {
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
                fetchComentarios(data.post.id);
            }
            catch (err: unknown) {
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
                    {/* ... (todo el código del artículo permanece igual) ... */}

                    {/* Contenido del artículo */}
                    <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                        <div
                            className="article-content"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n+/g, '') }}
                        ></div>

                        <div>
                            <CommentTree
                                comments={comentariosArbol}
                                onReply={handleReply}
                                onDelete={handleDelete}
                            />
                        </div>

                        <div className="mt-12 border-t pt-6" id="comment-editor">
                            <h3 className="titulodelazonacomement white">
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
                            />
                        </div>
                    </div>

                    {/* ... (resto del código permanece igual) ... */}
                </div>
            </article>
        </>
    );
}