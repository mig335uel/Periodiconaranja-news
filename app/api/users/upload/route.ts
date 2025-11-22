/*eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest){
    const supabase = await createClient();


    
}