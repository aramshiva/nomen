import { NextRequest, NextResponse } from "next/server";
import { calculateSurvivalProbability } from "@/lib/actuarial";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const gender = searchParams.get("gender");

  if (!name || !gender) {
    return NextResponse.json(
      {
        success: false,
        message: "Name and gender parameters are required",
      },
      { status: 400 },
    );
  }

  if (gender !== "M" && gender !== "F") {
    return NextResponse.json(
      {
        success: false,
        message: "Gender must be either 'M' or 'F'",
      },
      { status: 400 },
    );
  }

  try {
    const survivors = await calculateSurvivalProbability(
      name,
      gender as "M" | "F",
    );

    return NextResponse.json({
      success: true,
      data: {
        name,
        gender,
        estimatedSurvivors: survivors,
      },
    });
  } catch (error) {
    console.error("Error calculating survival probability:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error calculating survival probability",
      },
      { status: 500 },
    );
  }
}
