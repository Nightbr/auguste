import { describe, it, expect, beforeEach } from 'vitest';
import {
  setMemberAvailabilityTool,
  getMemberAvailabilityTool,
  bulkSetMemberAvailabilityTool,
  setMemberAvailabilityByNameTool,
  bulkSetMemberAvailabilityByNameTool,
  getFamilyAvailabilityForMealTool,
} from './availability-tools';
import { createFamilyTool } from './family-tools';
import { createMemberTool } from './member-tools';
import { db, schema, MemberType, MealType } from '../../domain';

describe('Availability Tools', () => {
  let familyId: string;
  let memberId: string;
  let memberName = 'Jean';

  beforeEach(async () => {
    await db.delete(schema.family);
    const family = await createFamilyTool.execute({
      name: 'Test Family',
      country: 'FR',
      language: 'fr',
    });
    familyId = family.id;

    const member = await createMemberTool.execute({
      familyId,
      name: memberName,
      type: MemberType.adult as any,
    });
    memberId = member.id;
  });

  it('should set member availability', async () => {
    const result = await setMemberAvailabilityTool.execute({
      memberId,
      mealType: MealType.dinner as any,
      dayOfWeek: 1, // Monday
      isAvailable: false,
    });

    expect(result.isAvailable).toBe(false);
    expect(result.memberId).toBe(memberId);
  });

  it('should get all availability for a member', async () => {
    await setMemberAvailabilityTool.execute({
      memberId,
      mealType: MealType.breakfast as any,
      dayOfWeek: 0,
      isAvailable: true,
    });
    await setMemberAvailabilityTool.execute({
      memberId,
      mealType: MealType.lunch as any,
      dayOfWeek: 0,
      isAvailable: false,
    });

    const result = await getMemberAvailabilityTool.execute({ memberId });
    expect(result).toHaveLength(2);
  });

  it('should bulk set availability', async () => {
    const result = await bulkSetMemberAvailabilityTool.execute({
      memberId,
      availability: [
        { mealType: MealType.breakfast as any, dayOfWeek: 1, isAvailable: true },
        { mealType: MealType.lunch as any, dayOfWeek: 1, isAvailable: false },
      ],
    });

    expect(result.recordsSet).toBe(2);
  });

  it('should set availability by name', async () => {
    const result = await setMemberAvailabilityByNameTool.execute({
      familyId,
      memberName,
      mealType: MealType.dinner as any,
      dayOfWeek: 5,
      isAvailable: false,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Jean');
    expect(result.message).toContain('not available');
  });

  it('should set availability by name (available case)', async () => {
    const result = await setMemberAvailabilityByNameTool.execute({
      familyId,
      memberName,
      mealType: MealType.breakfast as any,
      dayOfWeek: 1,
      isAvailable: true,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Jean');
    expect(result.message).toContain('available');
  });

  it('should bulk set availability by name', async () => {
    const result = await bulkSetMemberAvailabilityByNameTool.execute({
      familyId,
      memberName,
      availability: [{ mealType: MealType.dinner as any, dayOfWeek: 0, isAvailable: true }],
    });
    expect(result.success).toBe(true);
    expect(result.recordsSet).toBe(1);
  });

  it('should get family availability for a meal (defaulting to true)', async () => {
    await createMemberTool.execute({ familyId, name: 'Marie', type: MemberType.adult as any });

    // Set Jean as unavailable
    await setMemberAvailabilityByNameTool.execute({
      familyId,
      memberName: 'Jean',
      mealType: MealType.breakfast as any,
      dayOfWeek: 1,
      isAvailable: false,
    });

    const result = await getFamilyAvailabilityForMealTool.execute({
      familyId,
      mealType: MealType.breakfast as any,
      dayOfWeek: 1,
    });

    expect(result).toHaveLength(2);
    const jean = result.find((r) => r.memberName === 'Jean');
    const marie = result.find((r) => r.memberName === 'Marie');

    expect(jean?.isAvailable).toBe(false);
    expect(marie?.isAvailable).toBe(true); // Should default to true
  });

  it('should return found=false when setting availability by unknown name', async () => {
    const result = await setMemberAvailabilityByNameTool.execute({
      familyId,
      memberName: 'Ghost',
      mealType: MealType.breakfast as any,
      dayOfWeek: 1,
      isAvailable: true,
    });
    expect(result.success).toBe(false);
  });

  it('should return success=false when bulk setting availability by unknown name', async () => {
    const result = await bulkSetMemberAvailabilityByNameTool.execute({
      familyId,
      memberName: 'Ghost',
      availability: [],
    });
    expect(result.success).toBe(false);
  });

  it('should return zero if bulk availability is empty', async () => {
    const result = await bulkSetMemberAvailabilityTool.execute({
      memberId: '00000000-0000-4000-8000-000000000000',
      availability: [],
    });
    expect(result.recordsSet).toBe(0);
  });
});
