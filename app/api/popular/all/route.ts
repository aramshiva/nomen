import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unique_names } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sex = searchParams.get("sex");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");
  const offset = (page - 1) * pageSize;

  try {
    const baseQuery = db.select().from(unique_names);

    const query = sex ? baseQuery.where(eq(unique_names.sex, sex)) : baseQuery;

    const names = await query
      .orderBy(desc(unique_names.amount))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: names,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch popular names" },
      { status: 500 },
    );
  }
}
