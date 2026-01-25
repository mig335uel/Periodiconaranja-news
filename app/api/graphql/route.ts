
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, variables } = body;

        const response = await fetch(`${process.env.CMS_URL}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("GraphQL Proxy Error:", error);
        return NextResponse.json(
            { error: "Error communicating with GraphQL API" },
            { status: 500 }
        );
    }
}
