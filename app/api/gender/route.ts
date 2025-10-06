// hello!
// i just want to clarify something about this
// specific api! this api was made bc
// https://github.com/hackclub/orpheus-engine/blob/main/orpheus_engine/defs/genderize/resources.py
// is very expensive, and very iffy data wise.
// so i wanted to make a replacement where the data
// is known where it goes. i do not endorse usage
// of genderize apis.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { names } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawName = searchParams.get("name");

    if (!rawName) {
      return NextResponse.json(
        { success: false, message: "Parameter 'name' is required" },
        { status: 400 }
      );
    }

    const name = rawName.trim();
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name cannot be empty" },
        { status: 400 }
      );
    }

    const rows = await db
      .select({
        sex: names.sex,
        amount: sql<number>`SUM(${names.amount})`.as("amount"),
      })
      .from(names)
      .where(eq(names.name, name))
      .groupBy(names.sex);

    if (!rows.length) {
      return NextResponse.json({ sex: "U", breakdown: {} });
    }

    const total = Number(rows.reduce((sum, r) => sum + r.amount, 0));
    const breakdown: Record<string, { amount: number }> = {};
    for (const r of rows) {
      breakdown[r.sex] = { amount: r.amount };
    }

    let sex: "M" | "F" | "U" = "U";
    const entries = Object.entries(breakdown).sort(
      (a, b) => b[1].amount - a[1].amount
    );
    if (entries.length === 1) {
      sex = entries[0][0] as "M" | "F";
    } else if (entries.length >= 2) {
      sex = entries[0][0] as "M" | "F";
    }

    return NextResponse.json({ total, sex, breakdown });
  } catch (error) {
    console.error("error", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute gender distribution" },
      { status: 500 }
    );
  }
}
