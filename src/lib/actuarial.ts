import { db } from "./db";
import { actuary, names } from "./schema";
import { eq, and, inArray } from "drizzle-orm";

const mortalityCache = new Map<string, Map<number, number>>();

async function getMortalityData(gender: "M" | "F", ages: number[]): Promise<Map<number, number>> {
  const cacheKey = `${gender}-${ages.join(',')}`;
  
  if (mortalityCache.has(cacheKey)) {
    return mortalityCache.get(cacheKey)!;
  }

  const mortalityData = await db
    .select()
    .from(actuary)
    .where(
      and(
        eq(actuary.gender, gender),
        inArray(actuary.age, ages)
      )
    )
    .execute();

  const mortalityMap = new Map<number, number>();
  
  const ageGroups = new Map<number, typeof mortalityData>();
  mortalityData.forEach(record => {
    if (!ageGroups.has(record.age)) {
      ageGroups.set(record.age, []);
    }
    ageGroups.get(record.age)!.push(record);
  });

  ageGroups.forEach((records, age) => {
    const mostRecent = records.reduce((latest, current) => 
      current.year > latest.year ? current : latest
    );
    mortalityMap.set(age, 1 - mostRecent.probability_of_death);
  });

  mortalityCache.set(cacheKey, mortalityMap);
  
  return mortalityMap;
}

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
  
  const uniqueAges = new Set<number>();
  nameData.forEach(cohort => {
    const birthYear = cohort.year;
    const currentAge = currentYear - birthYear;
    uniqueAges.add(currentAge);
  });

  const mortalityMap = await getMortalityData(gender, Array.from(uniqueAges));

  let totalSurvivors = 0;
  for (const cohort of nameData) {
    const birthYear = cohort.year;
    const currentAge = currentYear - birthYear;
    const survivalProbability = mortalityMap.get(currentAge) || 0;
    const cohortSurvivors = Math.round(cohort.amount * survivalProbability);
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