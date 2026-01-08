import { describe, it, expect, beforeEach } from 'vitest';
import { getFamilySummaryTool } from './family-summary-tool';
import { createFamilyTool } from './family-tools';
import { createMemberTool } from './member-tools';
import { createPlannerSettingsTool } from './planner-tools';
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
    // Setup complex family state
    const member = await createMemberTool.execute({
      familyId,
      name: 'Jean',
      type: MemberType.adult as any,
    });

    await createPlannerSettingsTool.execute({
      familyId,
      defaultServings: 4,
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
    expect(result.plannerSettings.defaultServings).toBe(4);
  });

  it('should show incomplete if settings or members are missing', async () => {
    const result = await getFamilySummaryTool.execute({ familyId });
    expect(result.isComplete).toBe(false);
    expect(result.memberCount).toBe(0);
    expect(result.settingsFound).toBe(false);
  });
});
