import { db } from "@/src/lib/db";
import { names } from "@/src/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const sex = searchParams.get("sex");

    if (!name) {
      return NextResponse.json(
        { error: "Name parameters are required" },
        { status: 400 },
      );
    }

    const result = await db
      .select()
      .from(names)
      .where(
        sex
          ? and(eq(names.name, name), eq(names.sex, sex))
          : and(eq(names.name, name)),
      )
      .orderBy(asc(names.year));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch names" },
      { status: 500 },
    );
  }
}
