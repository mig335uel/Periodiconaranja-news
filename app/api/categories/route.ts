import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const response = await fetch('http://localhost/wp-json/wp/v2/categories?per_page=100&hide_empty=true');
        
        if (!response.ok) {
            throw new Error(`WordPress API returned ${response.status}`);
        }
        
        const categories = await response.json();

        // Ensure parent is number, already is from WP.
        // Return { categories: ... } as expected by the frontend hook
        return NextResponse.json({categories: categories}, {status: 200});
        
    }catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido.";
        console.error("CRITICAL CATEGORIES API CRASH:", e);

        return NextResponse.json(
            {error: "Internal Server Error during fetching categories.", details: errorMessage},
            {status: 500}
        );

    }

}
// NOTE: POST functionality for creating categories in WP would require authentication (Basic Auth/JWT/App Password).
// Leaving this commented or removed as it wasn't explicitly requested to implement WP Admin writes, but Supabase writes are being removed.
// If you need to create categories in WP via this app, we need to set up authentication.
export async function POST(req:NextRequest) {
    return NextResponse.json({message: "Creating categories via this API is not yet configured for WordPress."}, {status: 501});
}