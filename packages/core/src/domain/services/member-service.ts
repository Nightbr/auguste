import { db } from '../db';
import { member } from '../db/schema.drizzle';
import { eq } from 'drizzle-orm';

/**
 * Get all members for a family
 */
export async function getMembersByFamilyId(familyId: string) {
  return db.select().from(member).where(eq(member.familyId, familyId));
}

/**
 * Get a member by ID
 */
export async function getMemberById(memberId: string) {
  const result = await db.select().from(member).where(eq(member.id, memberId)).limit(1);
  return result[0] || null;
}

/**
 * Get members with their availability
 */
export async function getMembersWithAvailability(familyId: string) {
  const members = await getMembersByFamilyId(familyId);
  return members;
}
