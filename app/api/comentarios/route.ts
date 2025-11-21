
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";




interface ComentarioFormData {
    user_id?: string | null;
    post_id: string;
    parent_id?: string;
    content: string;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    status: 'approved' | 'pending' | 'spam';
};


export async function POST(req: NextRequest) {
    const {user_id, post_id, parent_id, content, anonymous_name, anonymous_email, status} = await req.json();

    const formData: ComentarioFormData = {
        user_id: user_id || null,
        post_id: post_id,
        parent_id: parent_id || null,
        content: content,
        anonymous_name: anonymous_name || null,
        anonymous_email: anonymous_email || null,
        status:  status
    }

    try{
        
        const supabase = await createClient();
        const {data: commentData, error: commentError} = await supabase.from('comments').insert(formData);
        
        if(commentError){
           return NextResponse.json({commentError}, {status: 400});
        }
        return NextResponse.json({commentData}, {status: 200});

        
    }catch(e: unknown){
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );
    }
    
}



export async function GET(req: NextRequest){

    try {
        const supabase = await createClient();
        const{data, error} = await supabase.from('comments').select('*, users(*), posts(title)');
        if(error){
            return NextResponse.json({message: "No se ha podido obtener los comentarios"}, {status: 400});
        }

        return NextResponse.json(data,{status: 200});
        
    } catch (e:unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );
    }

}

export interface Comentarios {
    id: string;
    user_id?: string | null;
    post_id: string;
    parent_id?: string | null;
    content: string;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    status: 'approved' | 'pending' | 'spam';
    created_at: string;
    updated_at: string;
}

export async function PUT(req: NextRequest){
    const body = await req.json();



    try {
        const supabase = await createClient();

        const {data:dataComment, error: errorComment} = await supabase.from('comments').select('*').eq('id', body.id).single();
        

        if(errorComment){
            return NextResponse.json({message: errorComment}, {status: 400});
        }

        let comentarioEncontrado = dataComment;

        comentarioEncontrado.status = body.status;


        const {data, error} = await supabase.from('comments').update(comentarioEncontrado).eq('id', body.id);

        if(error){
            return NextResponse.json({message: error}, {status: 400});
        }

        return NextResponse.json({message: "Comentario Actualizado"}, {status: 200});


    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );
        
    }
    
}



