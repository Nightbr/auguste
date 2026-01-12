import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPlannerSettingsTool,
  getPlannerSettingsTool,
  updatePlannerSettingsTool,
  parseCronScheduleTool,
} from './planner-tools';
import { createFamilyTool } from './family-tools';
import { db, schema, MealType, generateId, now } from '../../domain';

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

  it('should create planner settings for a family without settings', async () => {
    // Create a family directly in DB (without auto-created settings)
    const manualFamilyId = generateId();
    const timestamp = now();
    await db.insert(schema.family).values({
      id: manualFamilyId,
      name: 'Manual Family',
      country: 'US',
      language: 'en',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const result = await createPlannerSettingsTool.execute({
      familyId: manualFamilyId,
      mealTypes: [MealType.breakfast as any, MealType.dinner as any],
      defaultServings: 2,
    });

    expect(result.id).toBeDefined();
    expect(result.familyId).toBe(manualFamilyId);
    expect(result.mealTypes).toContain(MealType.breakfast);
    expect(result.defaultServings).toBe(2);
  });

  it('should get auto-created planner settings', async () => {
    // Family created via createFamilyTool automatically has settings
    const result = await getPlannerSettingsTool.execute({ familyId });

    expect(result.found).toBe(true);
    expect(result.settings?.familyId).toBe(familyId);
    expect(result.settings?.mealTypes).toEqual(['lunch', 'dinner']);
    expect(result.settings?.defaultServings).toBe(4);
  });

  it('should return found=false for non-existent planner settings', async () => {
    const result = await getPlannerSettingsTool.execute({
      familyId: '00000000-0000-4000-8000-000000000000',
    });
    expect(result.found).toBe(false);
  });

  it('should update planner settings', async () => {
    // Get auto-created settings
    const getResult = await getPlannerSettingsTool.execute({ familyId });
    const settingsId = getResult.settings!.id;

    const result = await updatePlannerSettingsTool.execute({
      id: settingsId,
      defaultServings: 6,
      timezone: 'Europe/Paris',
    });

    expect(result.found).toBe(true);
    expect(result.settings?.defaultServings).toBe(6);
    expect(result.settings?.timezone).toBe('Europe/Paris');
  });

  it('should update other planner settings fields independently', async () => {
    // Get auto-created settings
    const getResult = await getPlannerSettingsTool.execute({ familyId });
    const settingsId = getResult.settings!.id;

    const result = await updatePlannerSettingsTool.execute({
      id: settingsId,
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

  it('should parse cron schedule for specific day and time', async () => {
    const result = await parseCronScheduleTool.execute({ description: 'Sunday at 6pm' });
    expect(result.cron).toBe('0 18 * * 0');
    expect(result.humanReadable).toContain('Sunday');
    expect(result.humanReadable).toContain('6 PM');
  });

  it('should parse cron schedule for Friday evening', async () => {
    const result = await parseCronScheduleTool.execute({ description: 'Friday evening' });
    expect(result.cron).toBe('0 18 * * 5');
    expect(result.humanReadable).toContain('Friday');
    expect(result.humanReadable).toContain('6 PM');
  });

  it('should parse cron schedule for weekdays', async () => {
    const result = await parseCronScheduleTool.execute({ description: 'weekday mornings' });
    expect(result.cron).toBe('0 9 * * 1-5');
    expect(result.humanReadable).toContain('Monday to Friday');
    expect(result.humanReadable).toContain('9 AM');
  });

  it('should default to every day at 6pm for unknown description', async () => {
    const result = await parseCronScheduleTool.execute({ description: 'whenever' });
    // When no day or time is specified, defaults to every day at 6pm
    expect(result.cron).toBe('0 18 * * *');
    expect(result.humanReadable).toContain('Every day');
    expect(result.humanReadable).toContain('6 PM');
  });
});
