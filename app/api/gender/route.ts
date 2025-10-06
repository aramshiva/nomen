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
			return NextResponse.json({
				success: true,
				name,
				total: 0,
				breakdown: {},
				dominantSex: "U",
				confidence: 0,
				classification: "undetermined",
				threshold: { dominant: 0.9, unisexMin: 0.6 },
			});
		}

		const total = rows.reduce((sum, r) => sum + r.amount, 0);
		const breakdown: Record<string, { amount: number; percent: number }> = {};
		for (const r of rows) {
			breakdown[r.sex] = { amount: r.amount, percent: r.amount / total };
		}

		const dominantThreshold = 0.85;
		const unisexMin = 0.6;
		let dominantSex: "M" | "F" | "U" = "U";
		let confidence = 0;
		let classification: "male" | "female" | "unisex" | "undetermined" = "undetermined";

		const entries = Object.entries(breakdown).sort((a, b) => b[1].percent - a[1].percent);

		if (entries.length === 1) {
			dominantSex = entries[0][0] as "M" | "F";
			confidence = 1;
			classification = dominantSex === "M" ? "male" : "female";
			} else if (entries.length >= 2) {
				const [first] = entries;
			dominantSex = first[0] as "M" | "F";
			confidence = first[1].percent;
			if (first[1].percent >= dominantThreshold) {
				classification = dominantSex === "M" ? "male" : "female";
			} else {
				classification = "unisex";
			}
		}

		return NextResponse.json({
			success: true,
			name,
			total,
			breakdown,
			dominantSex,
			confidence: parseFloat(confidence.toFixed(4)),
			classification,
			threshold: { dominant: dominantThreshold, unisexMin },
			sexes: rows.length,
		});
	} catch (error) {
		console.error("/api/gender error", error);
		return NextResponse.json(
			{ success: false, message: "Failed to compute gender distribution" },
			{ status: 500 }
		);
	}
}

