import { describe, it, expect, beforeEach } from 'vitest';
import { createPlannerSettingsTool, getPlannerSettingsTool, updatePlannerSettingsTool, parseCronScheduleTool } from './planner-tools';
import { createFamilyTool } from './family-tools';
import { db, schema, MealType } from '../../domain';

describe('Planner Tools', () => {
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

  it('should create planner settings', async () => {
    const result = await createPlannerSettingsTool.execute({
      familyId,
      mealTypes: [MealType.breakfast as any, MealType.dinner as any],
      defaultServings: 2,
    });

    expect(result.id).toBeDefined();
    expect(result.familyId).toBe(familyId);
    expect(result.mealTypes).toContain(MealType.breakfast);
    expect(result.defaultServings).toBe(2);
  });

  it('should get planner settings', async () => {
    await createPlannerSettingsTool.execute({ familyId });
    const result = await getPlannerSettingsTool.execute({ familyId });

    expect(result.found).toBe(true);
    expect(result.settings?.familyId).toBe(familyId);
  });

  it('should return found=false for non-existent planner settings', async () => {
    const result = await getPlannerSettingsTool.execute({ familyId: '00000000-0000-4000-8000-000000000000' });
    expect(result.found).toBe(false);
  });

  it('should update planner settings', async () => {
    const settings = await createPlannerSettingsTool.execute({ familyId });
    const result = await updatePlannerSettingsTool.execute({
      id: settings.id,
      defaultServings: 6,
      timezone: 'Europe/Paris',
    });

    expect(result.found).toBe(true);
    expect(result.settings?.defaultServings).toBe(6);
    expect(result.settings?.timezone).toBe('Europe/Paris');
  });

  it('should update other planner settings fields independently', async () => {
    const settings = await createPlannerSettingsTool.execute({ familyId });
    const result = await updatePlannerSettingsTool.execute({
      id: settings.id,
      mealTypes: [MealType.lunch as any],
      activeDays: [1, 2, 3],
      notificationCron: '0 9 * * 1',
    });

    expect(result.found).toBe(true);
    expect(result.settings?.mealTypes).toEqual([MealType.lunch]);
    expect(result.settings?.activeDays).toEqual([1, 2, 3]);
    expect(result.settings?.notificationCron).toBe('0 9 * * 1');
  });

  it('should return found=false when updating non-existent planner settings', async () => {
    const result = await updatePlannerSettingsTool.execute({
      id: '00000000-0000-4000-8000-000000000000',
      defaultServings: 1,
    });
    expect(result.found).toBe(false);
  });

  it('should parse cron schedule', async () => {
    const result = await parseCronScheduleTool.execute({ description: 'Sunday at 6pm' });
    expect(result.cron).toBe('0 18 * * 0');
    expect(result.humanReadable).toContain('Sunday');
  });

  it('should return default cron for unknown description', async () => {
    const result = await parseCronScheduleTool.execute({ description: 'whenever' });
    expect(result.cron).toBe('0 18 * * 0');
    expect(result.humanReadable).toContain('defaulting');
  });
});
