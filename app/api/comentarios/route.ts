// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient } from "@/lib/supabase/server";


type Context = {
    params: Promise<{ post_id: string }>;
};

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



