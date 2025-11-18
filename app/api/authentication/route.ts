import {createClient} from "@/lib/supabase/server";
import {NextRequest, NextResponse} from "next/server";




export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const {data:dataAuth, error:errorAuth} = await supabase.auth.getUser();

    if (errorAuth) {
        return NextResponse.json({error: errorAuth.message}, {status: 400});
    }
    const {data, error} = await supabase.from('users').select('*').eq('id', dataAuth.user?.id).single();
    if(error){
        return NextResponse.json({error: error.message}, {status: 400});
    }
    return NextResponse.json({authenticated:true, user: data}, {status: 200});

}