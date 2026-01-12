import { describe, it, expect, beforeEach } from 'vitest';
import { getFamilySummaryTool } from './family-summary-tool';
import { createFamilyTool } from './family-tools';
import { createMemberTool } from './member-tools';
import { setMemberAvailabilityTool } from './availability-tools';
import { db, schema, MemberType, MealType } from '../../domain';

describe('Family Summary Tool', () => {
  let familyId: string;

  beforeEach(async () => {
    await db.delete(schema.family);
    const family = await createFamilyTool.execute({
      name: 'Test Family',
      country: 'FR',
      language: 'fr',
    });
    familyId = family.id;
  });

  it('should return a complete summary of the family', async () => {
    // Setup complex family state - planner settings are auto-created with family
    const member = await createMemberTool.execute({
      familyId,
      name: 'Jean',
      type: MemberType.adult as any,
    });

    await setMemberAvailabilityTool.execute({
      memberId: member.id,
      mealType: MealType.dinner as any,
      dayOfWeek: 1,
      isAvailable: false,
    });

    const result = await getFamilySummaryTool.execute({ familyId });

    expect(result.familyFound).toBe(true);
    expect(result.memberCount).toBe(1);
    expect(result.settingsFound).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.memberNames).toContain('Jean');
    expect(result.memberAvailability).toHaveLength(1);
    // Planner settings should be present
    expect(result.plannerSettings).toBeDefined();
  });

  it('should show incomplete if members are missing', async () => {
    // Family has auto-created settings but no members
    const result = await getFamilySummaryTool.execute({ familyId });
    expect(result.isComplete).toBe(false);
    expect(result.memberCount).toBe(0);
    expect(result.settingsFound).toBe(true); // Settings are now auto-created
  });
});
