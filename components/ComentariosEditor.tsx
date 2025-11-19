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


//cambio por textArea

export default function ComentariosEditor({ postId, parentID }: { postId: string, parentID?: string }) {
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

    const publicarComentario = async () => {
        try {
            setCommentFormData((prevData)=>({...prevData, }))
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
                alert('Comentario publicado');
                // Limpiar el editor después de publicar
                window.location.reload();
            } else {
                // Manejar errores
                console.error('Error al publicar el comentario');
            }
        } catch (error) {
            console.error('Error al publicar el comentario:', error);
        }
    }

    const cancelarComentario = () =>{
        setCommentFormData((prevData)=>({...prevData, parent_id: null}));
    }

    return (
        <EditorContext.Provider value={{ editor }}>

            {/* <EditorContent editor={editor}
            value="presentation"
            /> */}
            {user ? (
                <form onSubmit={publicarComentario}>
                    <textarea
                        value={commentFormData.content}
                        
                        name="content"
                        placeholder="Escriba su comentario"
                        onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, content: "<p>" + e.target.value + "</p>" }))}
                    />
                    <div className="flex justify-end">
                        {commentFormData.parent_id !== null ?(
                            <>
                                <Button onClick={cancelarComentario} variant="default" type="submit" className="comentarios-editor-button">Cancelar Comentario</Button>
                                <Button onClick={publicarComentario} variant="default" type="submit" className="comentarios-editor-button">Publicar Comentario</Button>
                            </>
                        ):(
                            <Button onClick={publicarComentario} variant="default" type="submit" className="comentarios-editor-button">Publicar Comentario</Button>
                        )}
                    </div>
                </form>
            ) : (
                <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md">
                    <form onSubmit={publicarComentario} className="space-y-2">
                        <input
                            type="text"
                            name="anonymous_name"
                            value={commentFormData.anonymous_name!}
                            placeholder="Nombre"
                            className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, anonymous_name: e.target.value }))}
                            required />
                        <input
                            type="email"
                            name="anonymous_email"
                            className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            value={commentFormData.anonymous_email!}
                            placeholder="Correo Electrónico"
                            onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, anonymous_email: e.target.value }))}
                            required />
                        <textarea
                            value={commentFormData.content}
                            name="content"
                            className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="Escriba su comentario"
                            onChange={(e) => setCommentFormData((prevData) => ({ ...prevData, content: "<p>" + e.target.value + "</p>" }))}
                        />
                        <div className="flex justify-end">
                            <Button onClick={publicarComentario} variant="default" type="submit" className="comentarios-editor-button">Publicar Comentario</Button>
                        </div>
                    </form>
                </div>
            )}
        </EditorContext.Provider>
    );
}