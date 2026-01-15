import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMealPlanning,
  getMealPlanning,
  updateMealPlanning,
  createMealEvent,
  updateMealEvent,
  deleteMealEvent,
  getMealEvents,
} from './meal-tools';
import { createFamilyTool } from './family-tools';
import { createMemberTool } from './member-tools';
import { db, schema, MealType, MemberType } from '../../domain';

describe('Meal Tools', () => {
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

  it('should create and get meal planning', async () => {
    const planning = await createMealPlanning.execute({
      familyId,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
      status: 'active',
    });

    expect(planning.id).toBeDefined();
    expect(planning.status).toBe('active');

    const result = await getMealPlanning.execute({ id: planning.id });
    expect(result?.id).toBe(planning.id);
  });

  it('should create, update, and get meal events', async () => {
    const planning = await createMealPlanning.execute({
      familyId,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
    });

    const member = await createMemberTool.execute({
      familyId,
      name: 'Jean',
      type: MemberType.adult as any,
    });

    const event = await createMealEvent.execute({
      familyId,
      planningId: planning.id,
      date: '2026-01-02',
      mealType: MealType.dinner as any,
      recipeName: 'Pasta Carbonara',
      participants: [member.id],
    });

    expect(event.recipeName).toBe('Pasta Carbonara');
    expect(event.participants).toContain(member.id);

    const updated = await updateMealEvent.execute({
      id: event.id,
      recipeName: 'Pasta Bolognese',
    });
    expect(updated.recipeName).toBe('Pasta Bolognese');

    const events = await getMealEvents.execute({
      familyId,
      startDate: '2026-01-01',
      endDate: '2026-01-03',
    });
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe(event.id);
  });

  it('should throw error when creating meal planning for non-existent family', async () => {
    await expect(
      createMealPlanning.execute({
        familyId: '00000000-0000-4000-8000-000000000000',
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      }),
    ).rejects.toThrow('Failed to create meal planning');
  });

  it('should throw error when creating meal event with invalid planning ID', async () => {
    await expect(
      createMealEvent.execute({
        familyId,
        planningId: '00000000-0000-4000-8000-000000000000',
        date: '2026-01-02',
        mealType: MealType.dinner as any,
        recipeName: 'Test',
      }),
    ).rejects.toThrow('Failed to create meal event');
  });

  it('should throw error when updating non-existent meal event', async () => {
    await expect(
      updateMealEvent.execute({ id: '00000000-0000-4000-8000-000000000000' }),
    ).rejects.toThrow('Failed to update meal event');
  });

  it('should update meal planning status', async () => {
    const planning = await createMealPlanning.execute({
      familyId,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
      status: 'draft',
    });

    expect(planning.status).toBe('draft');

    const updated = await updateMealPlanning.execute({
      id: planning.id,
      status: 'active',
    });

    expect(updated.status).toBe('active');

    const completed = await updateMealPlanning.execute({
      id: planning.id,
      status: 'completed',
    });

    expect(completed.status).toBe('completed');
  });

  it('should throw error when updating non-existent meal planning', async () => {
    await expect(
      updateMealPlanning.execute({
        id: '00000000-0000-4000-8000-000000000000',
        status: 'active',
      }),
    ).rejects.toThrow('not found');
  });

  it('should delete a meal event', async () => {
    const planning = await createMealPlanning.execute({
      familyId,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
    });

    const event = await createMealEvent.execute({
      familyId,
      planningId: planning.id,
      date: '2026-01-02',
      mealType: MealType.dinner as any,
      recipeName: 'To be deleted',
    });

    // Verify event exists
    const eventsBefore = await getMealEvents.execute({
      familyId,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
    });
    expect(eventsBefore).toHaveLength(1);

    // Delete the event
    const result = await deleteMealEvent.execute({ id: event.id });
    expect(result.success).toBe(true);
    expect(result.deletedId).toBe(event.id);

    // Verify event is deleted
    const eventsAfter = await getMealEvents.execute({
      familyId,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
    });
    expect(eventsAfter).toHaveLength(0);
  });

  it('should throw error when deleting non-existent meal event', async () => {
    await expect(
      deleteMealEvent.execute({ id: '00000000-0000-4000-8000-000000000000' }),
    ).rejects.toThrow('Failed to delete meal event');
  });
});
