/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { StarterKit } from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import './ComentariosEditor.scss';

interface ComentarioFormData {
    user_id: string | null;
    post_id: string;
    parent_id?: string | null;
    content: string;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    status: 'approved' | 'pending' | 'spam';
};

export default function ComentariosEditor({ postId, parentID, onCommentSubmitted }: { postId: string, parentID: string | null, onCommentSubmitted: () => void }) {
    const { user } = useAuth();

    const [commentFormData, setCommentFormData] = useState<ComentarioFormData>({
        user_id: null,
        post_id: postId,
        parent_id: parentID,
        content: '',
        anonymous_name: null,
        anonymous_email: null,
        status: 'pending',
    });

    // Sync parent_id from props to state
    useEffect(() => {
        setCommentFormData((prevData) => ({
            ...prevData,
            parent_id: parentID,
        }));
    }, [parentID]);

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
            attributes: {
                autocomplete: "off",
                autocorrect: "off",
                autocapitalize: "off",
                class: "prose w-full sm:prose-sm lg:prose-lg xl:prose-2xl mb-5 focus:outline-none border rounded p-2 min-h-[100px]",
            },
        },
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
        ],
        content: commentFormData.content,
        onUpdate: ({ editor }) => {
            const content = editor.getHTML();
            setCommentFormData((prevData) => ({
                ...prevData,
                content: content,
            }));
        }
    });

    useEffect(() => {
        if (user) {
            setCommentFormData((prevData) => ({
                ...prevData,
                user_id: user.id,
            }));

            if (user.role === 'admin' || user.role === 'editor' || user.role === 'author') {
                setCommentFormData((prevData) => ({
                    ...prevData,
                    status: 'approved',
                }));
            }
        }
    }, [user]);

    // MODIFICACIÓN CLAVE: Recibe el evento y llama a preventDefault()
    const publicarComentario = async (e: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // <-- Detiene el comportamiento predeterminado del formulario (el GET)
        console.log(commentFormData.parent_id);
        try {
            const response = await fetch('/api/comentarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentFormData),
                credentials: 'include',
            });

            if (response.ok) {
                // Comentario publicado con éxito
                // NO USES alert(), solo console.log para entorno de desarrollo
                console.log('Comentario publicado con éxito');
                // Limpiar el estado del formulario después de publicar
                setCommentFormData((prevData) => ({
                    ...prevData,
                    content: '',
                    anonymous_name: null,
                    anonymous_email: null,
                    parent_id: parentID, // Restablecer parent_id
                }));

                onCommentSubmitted();
            } else {
                // Manejar errores
                const errorData = await response.json(); // Lee el cuerpo una vez
                console.error('Error al publicar el comentario:', errorData);
            }
        } catch (error) {
            console.error('Error al publicar el comentario:', error);
        }
    }

    const cancelarComentario = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Previene la sumisión del formulario al cancelar
        setCommentFormData((prevData) => ({ ...prevData, parent_id: undefined, content: '' }));
    }

    return (
        <EditorContext.Provider value={{ editor }}>
            {user ? (
                // El formulario llama a publicarComentario con el evento
                <form onSubmit={publicarComentario}>
                    <textarea
                        value={commentFormData.content}
                        className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                        name="content"
                        placeholder="Escriba su comentario"
                        onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, content: e.target.value }))}
                    />
                    <div className="flex justify-end space-x-2">
                        {/* Se recomienda que solo el botón de cancelar tenga un onClick */}
                        {commentFormData.parent_id !== null && commentFormData.parent_id !== undefined && (
                            <Button onClick={cancelarComentario} variant="outline" type="button" className="comentarios-editor-button">Cancelar Respuesta</Button>
                        )}
                        <Button variant="default" type="submit" className="comentarios-editor-button">
                            Publicar Comentario
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md">
                    {/* El formulario de usuario anónimo también usa onSubmit={publicarComentario} */}
                    <form onSubmit={publicarComentario} className="space-y-2">
                        <input
                            type="text"
                            name="anonymous_name"
                            value={commentFormData.anonymous_name ?? ''}
                            placeholder="Nombre"
                            className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, anonymous_name: e.target.value }))}
                            required />
                        <input
                            type="email"
                            name="anonymous_email"
                            className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            value={commentFormData.anonymous_email ?? ''}
                            placeholder="Correo Electrónico"
                            onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, anonymous_email: e.target.value }))}
                            required />
                        <textarea
                            value={commentFormData.content}
                            name="content"
                            className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="Escriba su comentario"
                            onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, content: e.target.value }))}
                        />
                        <div className="flex justify-end">
                            {commentFormData.parent_id !== null && commentFormData.parent_id !== undefined && (
                                <Button onClick={cancelarComentario} variant="outline" type="button" className="comentarios-editor-button">Cancelar Respuesta</Button>
                            )}
                            <Button variant="default" type="submit" className="comentarios-editor-button">
                                Publicar Comentario
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </EditorContext.Provider>
    );
}