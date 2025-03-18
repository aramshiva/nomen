import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { names } from "@/lib/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const sex = searchParams.get("sex");

    if (!year) {
        return NextResponse.json(
            { success: false, message: "Year parameter is required" },
            { status: 400 }
        );
    }

    try {
        const conditions = [];
        
        if (year !== 'all') {
            conditions.push(eq(names.year, parseInt(year)));
        }
        
        if (sex) {
            conditions.push(eq(names.sex, sex));
        }

        let query = db
            .select({
                name: names.name,
                total: sql`SUM(${names.amount})`.as('total')
            })
            .from(names);
            
        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        query = query
            .groupBy(names.name)
            .orderBy(desc(sql`total`))
            .limit(500);

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
