import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { names } from "@/lib/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    try {
        let query = db
            .select({
                name: names.name,
                total: sql`SUM(${names.amount})`.as('total')
            })
            .from(names)
            .groupBy(names.name)
            .orderBy(desc(sql`total`));

        if (name) {
            query = query.where(eq(names.name, name));
        }

        const popularNames = await query;

        return NextResponse.json({ 
            success: true, 
            data: popularNames 
        });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch popular names" },
            { status: 500 }
        );
    }
}