import { db, generateId, now } from '../db';
import { family, plannerSettings } from '../db/schema.drizzle';
import { eq } from 'drizzle-orm';

/**
 * Get a family by ID
 */
export async function getFamilyById(familyId: string) {
  const result = await db.select().from(family).where(eq(family.id, familyId)).limit(1);
  return result[0] || null;
}

/**
 * Get all families
 */
export async function getAllFamilies() {
  return db.select().from(family);
}

/**
 * Get family with all related data
 */
export async function getFamilyWithDetails(familyId: string) {
  const familyData = await getFamilyById(familyId);
  if (!familyData) {
    return null;
  }

  return {
    ...familyData,
    // Related data will be fetched separately for better performance
  };
}

/**
 * Create a new family
 */
export async function createFamily({
  name,
  country,
  language,
}: {
  name: string;
  country: string;
  language: string;
}) {
  const id = generateId();
  const timestamp = now();

  const [newFamily] = await db
    .insert(family)
    .values({
      id,
      name,
      country: country.toUpperCase(),
      language: language.toLowerCase(),
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  // Create default planner settings for the new family
  await db.insert(plannerSettings).values({
    id: generateId(),
    familyId: id,
    mealTypes: ['lunch', 'dinner'],
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    notificationCron: '0 18 * * 0',
    timezone: 'UTC',
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return newFamily;
}
