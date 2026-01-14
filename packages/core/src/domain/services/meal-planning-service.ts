import { db } from '../db';
import { mealPlanning } from '../db/schema.drizzle';
import { eq, and, lte, gte, ne } from 'drizzle-orm';
import { generateId, now } from '../db';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import type { MealPlanning, CreateMealPlanningInput } from '../schemas/meal-planner.schema';

/**
 * Error thrown when attempting to create/update a meal planning
 * with dates that overlap an existing planning for the same family.
 */
export class MealPlanningOverlapError extends Error {
  constructor(
    public readonly conflictingPlannings: MealPlanning[],
    message?: string,
  ) {
    const defaultMessage = `Date range overlaps with existing meal planning(s): ${conflictingPlannings.map((p) => `${p.startDate} to ${p.endDate}`).join(', ')}`;
    super(message || defaultMessage);
    this.name = 'MealPlanningOverlapError';
  }
}

/**
 * Check if a date range overlaps with existing meal plannings for a family.
 * Overlap condition: existingStart <= newEnd AND existingEnd >= newStart
 *
 * @param familyId - The family ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param excludeId - Optional planning ID to exclude (for updates)
 * @returns Array of overlapping plannings, or empty array if none
 */
export async function findOverlappingMealPlannings(
  familyId: string,
  startDate: string,
  endDate: string,
  excludeId?: string,
): Promise<MealPlanning[]> {
  // Overlap condition: existingStart <= newEnd AND existingEnd >= newStart
  const conditions = [
    eq(mealPlanning.familyId, familyId),
    lte(mealPlanning.startDate, endDate),
    gte(mealPlanning.endDate, startDate),
  ];

  // Exclude a specific planning (used for updates)
  if (excludeId) {
    conditions.push(ne(mealPlanning.id, excludeId));
  }

  const overlapping = await db
    .select()
    .from(mealPlanning)
    .where(and(...conditions));

  return overlapping as MealPlanning[];
}

/**
 * Create a new meal planning with overlap validation.
 * Throws MealPlanningOverlapError if the date range overlaps with existing plannings.
 *
 * @param input - The meal planning input data
 * @returns The created meal planning
 * @throws MealPlanningOverlapError if dates overlap with existing planning
 */
export async function createMealPlanning(input: CreateMealPlanningInput): Promise<MealPlanning> {
  const { familyId, startDate, endDate, status } = input;

  // Check for overlapping plannings
  const overlapping = await findOverlappingMealPlannings(familyId, startDate, endDate);

  if (overlapping.length > 0) {
    throw new MealPlanningOverlapError(overlapping);
  }

  const id = generateId();
  const timestamp = now();

  const [planning] = await db
    .insert(mealPlanning)
    .values({
      id,
      familyId,
      startDate,
      endDate,
      status: status || 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  return planning as MealPlanning;
}

/**
 * Update a meal planning with overlap validation (if dates are changed).
 *
 * @param id - The meal planning ID to update
 * @param updates - The fields to update
 * @returns The updated meal planning
 * @throws MealPlanningOverlapError if new dates overlap with existing planning
 * @throws Error if meal planning not found
 */
export async function updateMealPlanning(
  id: string,
  updates: Partial<Pick<CreateMealPlanningInput, 'startDate' | 'endDate' | 'status'>>,
): Promise<MealPlanning> {
  // First, get the existing planning to check dates
  const [existing] = await db.select().from(mealPlanning).where(eq(mealPlanning.id, id));

  if (!existing) {
    throw new Error(`Meal planning with id ${id} not found`);
  }

  // If dates are being changed, check for overlaps
  const newStartDate = updates.startDate || existing.startDate;
  const newEndDate = updates.endDate || existing.endDate;

  if (updates.startDate || updates.endDate) {
    const overlapping = await findOverlappingMealPlannings(
      existing.familyId,
      newStartDate,
      newEndDate,
      id, // Exclude current planning from overlap check
    );

    if (overlapping.length > 0) {
      throw new MealPlanningOverlapError(overlapping);
    }
  }

  const timestamp = now();

  const [updated] = await db
    .update(mealPlanning)
    .set({
      ...updates,
      updatedAt: timestamp,
    })
    .where(eq(mealPlanning.id, id))
    .returning();

  return updated as MealPlanning;
}

/**
 * Find an existing meal planning that contains a specific date.
 *
 * @param familyId - The family ID
 * @param date - The date to find a planning for (YYYY-MM-DD)
 * @returns The meal planning containing the date, or null if none exists
 */
export async function findMealPlanningForDate(
  familyId: string,
  date: string,
): Promise<MealPlanning | null> {
  const [planning] = await db
    .select()
    .from(mealPlanning)
    .where(
      and(
        eq(mealPlanning.familyId, familyId),
        lte(mealPlanning.startDate, date),
        gte(mealPlanning.endDate, date),
      ),
    )
    .limit(1);

  return (planning as MealPlanning) || null;
}

/**
 * Find an existing meal planning for a date, or create a new weekly planning if none exists.
 * The new planning will span the week (Sunday to Saturday) containing the given date.
 *
 * @param familyId - The family ID
 * @param date - The date to find/create a planning for (YYYY-MM-DD)
 * @returns The existing or newly created meal planning
 */
export async function findOrCreateMealPlanningForDate(
  familyId: string,
  date: string,
): Promise<MealPlanning> {
  // First, try to find an existing planning for this date
  const existing = await findMealPlanningForDate(familyId, date);
  if (existing) {
    return existing;
  }

  // No planning exists - create a new weekly planning
  // Calculate the week boundaries (Sunday to Saturday)
  const dateObj = new Date(date);
  const weekStart = startOfWeek(dateObj, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(dateObj, { weekStartsOn: 0 }); // Saturday

  const startDate = format(weekStart, 'yyyy-MM-dd');
  const endDate = format(weekEnd, 'yyyy-MM-dd');

  // Create the new planning (uses the service function with overlap validation)
  return createMealPlanning({
    familyId,
    startDate,
    endDate,
    status: 'draft',
  });
}
