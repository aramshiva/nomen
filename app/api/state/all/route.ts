import { db } from "@/lib/db";
import { uniquenamesbyarea } from "@/lib/schema";
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

    const result = await db
      .select()
      .from(uniquenamesbyarea)
      .where(
        state
          ? sex
            ? and(
                eq(uniquenamesbyarea.name, name),
                eq(uniquenamesbyarea.sex, sex),
                eq(uniquenamesbyarea.state, state),
              )
            : and(
                eq(uniquenamesbyarea.name, name),
                eq(uniquenamesbyarea.state, state),
              )
          : sex
            ? and(
                eq(uniquenamesbyarea.name, name),
                eq(uniquenamesbyarea.sex, sex),
              )
            : eq(uniquenamesbyarea.name, name),
      )
      .orderBy(asc(uniquenamesbyarea.state));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch names" },
      { status: 500 },
    );
  }
}
