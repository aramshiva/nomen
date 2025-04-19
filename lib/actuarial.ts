import { db } from "./db";
import { actuary, names } from "./schema";
import { eq, and } from "drizzle-orm";

export async function calculateSurvivalProbability(
  name: string,
  gender: "M" | "F"
): Promise<number> {
  const nameData = await db
    .select()
    .from(names)
    .where(
      and(
        eq(names.name, name),
        eq(names.sex, gender)
      )
    )
    .execute();

  if (nameData.length === 0) {
    return 0;
  }

  const currentYear = new Date().getFullYear();
  let totalSurvivors = 0;

  for (const cohort of nameData) {
    const birthYear = cohort.year;
    const currentAge = currentYear - birthYear;
    
    const mortalityData = await db
      .select()
      .from(actuary)
      .where(
        and(
          eq(actuary.gender, gender),
          eq(actuary.age, currentAge)
        )
      )
      .execute();

    if (mortalityData.length === 0) {
      continue;
    }

    const mostRecentMortality = mortalityData.reduce((latest, current) => 
      current.year > latest.year ? current : latest
    );

    const probabilityOfDeath = mostRecentMortality.probability_of_death;
    const cohortSurvivors = Math.round(cohort.amount * (1 - probabilityOfDeath));
    totalSurvivors += cohortSurvivors;
  }

  return totalSurvivors;
}

export async function getSurvivalProbability(
  gender: "M" | "F",
  age: number
): Promise<number> {
  const mortalityData = await db
    .select()
    .from(actuary)
    .where(
      and(
        eq(actuary.gender, gender),
        eq(actuary.age, age)
      )
    )
    .execute();

  if (mortalityData.length === 0) {
    return 0;
  }

  const mostRecentMortality = mortalityData.reduce((latest, current) => 
    current.year > latest.year ? current : latest
  );

  return 1 - mostRecentMortality.probability_of_death;
} 