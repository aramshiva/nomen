import { db } from "@/lib/db";
import { namesbyarea } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get("name");
        const sex = searchParams.get("sex");
        const state = searchParams.get("state");

        if (!name) {
            return NextResponse.json(
                { error: "Name parameters are required" },
                { status: 400 },
            );
        }

        const conditions = [eq(namesbyarea.name, name)];
        
        if (sex) {
            conditions.push(eq(namesbyarea.sex, sex));
        }
        
        if (state) {
            conditions.push(eq(namesbyarea.state, state));
        }

        const result = await db
            .select()
            .from(namesbyarea)
            .where(and(...conditions))
            .orderBy(asc(namesbyarea.year));

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch names" },
            { status: 500 },
        );
    }
}
