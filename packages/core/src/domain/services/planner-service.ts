import { db } from '../db';
import { memberAvailability, plannerSettings, mealPlanning, mealEvent } from '../db/schema.drizzle';
import { eq, desc } from 'drizzle-orm';

/**
 * Get availability for all members in a family
 */
export async function getAvailabilityByFamilyId(familyId: string) {
  // Join with member table to filter by family
  const { member } = await import('../db/schema.drizzle');
  return db
    .select({
      id: memberAvailability.id,
      memberId: memberAvailability.memberId,
      memberName: member.name,
      mealType: memberAvailability.mealType,
      dayOfWeek: memberAvailability.dayOfWeek,
      isAvailable: memberAvailability.isAvailable,
    })
    .from(memberAvailability)
    .innerJoin(member, eq(memberAvailability.memberId, member.id))
    .where(eq(member.familyId, familyId));
}

/**
 * Get planner settings for a family
 */
export async function getPlannerSettingsByFamilyId(familyId: string) {
  const result = await db
    .select()
    .from(plannerSettings)
    .where(eq(plannerSettings.familyId, familyId))
    .limit(1);
  return result[0] || null;
}

/**
 * Get the most recent meal planning for a family
 */
export async function getMealPlanningByFamilyId(familyId: string) {
  const result = await db
    .select()
    .from(mealPlanning)
    .where(eq(mealPlanning.familyId, familyId))
    .orderBy(desc(mealPlanning.createdAt))
    .limit(1);
  return result[0] || null;
}

/**
 * Get all meal plannings for a family, ordered by start date descending
 */
export async function getAllMealPlanningsByFamilyId(familyId: string) {
  return db
    .select()
    .from(mealPlanning)
    .where(eq(mealPlanning.familyId, familyId))
    .orderBy(desc(mealPlanning.startDate));
}

/**
 * Get all meal events for a family
 */
export async function getMealEventsByFamilyId(familyId: string) {
  return db.select().from(mealEvent).where(eq(mealEvent.familyId, familyId));
}
