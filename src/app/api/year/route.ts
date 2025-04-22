import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { names } from "@/src/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const sex = searchParams.get("sex");

  if (!year) {
    return NextResponse.json(
      { success: false, message: "Year parameter is required" },
      { status: 400 },
    );
  }

  try {
    const conditions = [];

    // Only add year condition if year is not 'all'
    if (year !== "all") {
      conditions.push(eq(names.year, parseInt(year)));
    }

    if (sex) {
      conditions.push(eq(names.sex, sex));
    }

    const query = db
      .select({
        name: names.name,
        year: names.year,
        sex: names.sex,
        amount: names.amount,
      })
      .from(names)
      .orderBy(desc(names.amount))
      .limit(500);

    // Only apply where clause if there are conditions
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const popularNames = await query;

    return NextResponse.json({
      success: true,
      data: popularNames,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch popular names" },
      { status: 500 },
    );
  }
}
