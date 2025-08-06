import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unique_names } from "@/lib/schema";
import { desc, sql } from "drizzle-orm";
import { calculateSurvivalProbability } from "@/lib/actuarial";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const offset = (page - 1) * limit;

    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(unique_names);

    const totalCount = Number(totalCountResult[0]?.count || 0);

    const names = await db
      .select()
      .from(unique_names)
      .orderBy(desc(unique_names.amount))
      .limit(limit)
      .offset(offset);

    const namesWithSurvival = await Promise.all(
      names.map(async (nameData) => {
        try {
          const gender = nameData.sex === "M" ? "M" : "F";
          const survivors = await calculateSurvivalProbability(
            nameData.name,
            gender,
          );

          return {
            ...nameData,
            estimatedSurvivors: survivors,
          };
        } catch (error) {
          console.error(`Error calculating for ${nameData.name}:`, error);
          return nameData;
        }
      }),
    );

    return NextResponse.json({
      success: true,
      data: namesWithSurvival,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch names data" },
      { status: 500 },
    );
  }
}
