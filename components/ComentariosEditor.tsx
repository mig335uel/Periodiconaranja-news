"use client";





import {EditorContent, EditorContext, useEditor} from "@tiptap/react";
import {useEffect, useState} from "react";
import {StarterKit} from "@tiptap/starter-kit";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/hooks/useAuth";
import '@/components/ComentariosEditor.scss';
interface ComentarioFormData {
    user_id: string;
    post_id: string;
    parent_id?: string;
    content: string;
    status: 'approved' | 'pending' | 'spam';
};




export default function ComentariosEditor({postId, parentID}: {postId: string, parentID?: string}) {
    const {user} = useAuth();
    const [commentFormData, setCommentFormData] = useState<ComentarioFormData>({
        user_id: '',
        post_id: postId,
        parent_id: parentID,
        content: '',
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

                class:"prose w-full sm:prose-sm lg:prose-lg xl:prose-2xl mb-5 focus:outline-none border rounded p-2 min-h-[100px] text",
            },
        },
        extensions:[
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
        ],
        content: commentFormData.content,
        onUpdate: ({editor}) => {
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
            }) );

            if(user.role === 'admin' || user.role === 'editor' || user.role === 'author') {
                setCommentFormData((prevData) => ({
                    ...prevData,
                    status: 'approved',
                }));
            }
        }
    }, [user]);

    const publicarComentario= async () =>{
        try{
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
                console.log('Comentario publicado');
                // Limpiar el editor después de publicar
                editor?.commands.clearContent();
            } else {
                // Manejar errores
                console.error('Error al publicar el comentario');
            }
        }catch(error){
            console.error('Error al publicar el comentario:', error);
        }
    }

    return (
        <EditorContext.Provider value={{editor}}>

            <EditorContent editor={editor}
            value="presentation"
            />
            <div className="flex justify-end">
                <Button onClick={publicarComentario} variant="default" className="comentarios-editor-button">Publicar Comentario</Button>
            </div>

        </EditorContext.Provider>
    );
}