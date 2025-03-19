import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unique_names } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sex = searchParams.get("sex");
    
    try {
        const baseQuery = db
            .select()
            .from(unique_names);
            
        const query = sex 
            ? baseQuery.where(eq(unique_names.sex, sex))
            : baseQuery;
        
        const names = await query
            .orderBy(desc(unique_names.amount))
            .limit(500);

        return NextResponse.json({ 
            success: true, 
            data: names 
        });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch popular names" },
            { status: 500 }
        );
    }
}
