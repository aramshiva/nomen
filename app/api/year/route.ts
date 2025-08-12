import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { names } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const sex = searchParams.get("sex");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");
  const offset = (page - 1) * pageSize;

  if (!year) {
    return NextResponse.json(
      { success: false, message: "Year parameter is required" },
      { status: 400 },
    );
  }

  try {
    let condition;
    if (sex && sex !== "all") {
      condition = and(eq(names.year, parseInt(year)), eq(names.sex, sex));
    } else {
      condition = eq(names.year, parseInt(year));
    }

    const query = db.select().from(names).where(condition);

    const result = await query
      .orderBy(desc(names.amount))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: result,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch names data" },
      { status: 500 },
    );
  }
}
