import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMealPlanning,
  updateMealPlanning,
  findOverlappingMealPlannings,
  MealPlanningOverlapError,
} from './meal-planning-service';
import { db } from '../db';
import { family, mealPlanning } from '../db/schema.drizzle';
import { generateId, now } from '../db';

describe('meal-planning-service', () => {
  let familyId: string;

  beforeEach(async () => {
    // Clean up tables
    await db.delete(mealPlanning);
    await db.delete(family);

    // Create test family
    const id = generateId();
    const timestamp = now();
    await db.insert(family).values({
      id,
      name: 'Test Family',
      country: 'FR',
      language: 'fr',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    familyId = id;
  });

  describe('createMealPlanning', () => {
    it('should create a meal planning successfully', async () => {
      const planning = await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
        status: 'draft',
      });

      expect(planning.id).toBeDefined();
      expect(planning.familyId).toBe(familyId);
      expect(planning.startDate).toBe('2026-01-01');
      expect(planning.endDate).toBe('2026-01-07');
      expect(planning.status).toBe('draft');
    });

    it('should create non-overlapping plannings successfully', async () => {
      // Week 1: Jan 1-7
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      // Week 2: Jan 8-14 (adjacent, no overlap)
      const planning2 = await createMealPlanning({
        familyId,
        startDate: '2026-01-08',
        endDate: '2026-01-14',
      });

      expect(planning2.startDate).toBe('2026-01-08');
    });

    it('should throw MealPlanningOverlapError for exact same dates', async () => {
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      await expect(
        createMealPlanning({
          familyId,
          startDate: '2026-01-01',
          endDate: '2026-01-07',
        }),
      ).rejects.toThrow(MealPlanningOverlapError);
    });

    it('should throw MealPlanningOverlapError for partial overlap (new ends during existing)', async () => {
      // Existing: Jan 5-12
      await createMealPlanning({
        familyId,
        startDate: '2026-01-05',
        endDate: '2026-01-12',
      });

      // New: Jan 1-7 (overlaps on Jan 5-7)
      await expect(
        createMealPlanning({
          familyId,
          startDate: '2026-01-01',
          endDate: '2026-01-07',
        }),
      ).rejects.toThrow(MealPlanningOverlapError);
    });

    it('should throw MealPlanningOverlapError for partial overlap (new starts during existing)', async () => {
      // Existing: Jan 1-7
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      // New: Jan 5-12 (overlaps on Jan 5-7)
      await expect(
        createMealPlanning({
          familyId,
          startDate: '2026-01-05',
          endDate: '2026-01-12',
        }),
      ).rejects.toThrow(MealPlanningOverlapError);
    });

    it('should throw MealPlanningOverlapError when new is fully inside existing', async () => {
      // Existing: Jan 1-14
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-14',
      });

      // New: Jan 5-10 (fully inside)
      await expect(
        createMealPlanning({
          familyId,
          startDate: '2026-01-05',
          endDate: '2026-01-10',
        }),
      ).rejects.toThrow(MealPlanningOverlapError);
    });

    it('should throw MealPlanningOverlapError when new fully contains existing', async () => {
      // Existing: Jan 5-10
      await createMealPlanning({
        familyId,
        startDate: '2026-01-05',
        endDate: '2026-01-10',
      });

      // New: Jan 1-14 (fully contains)
      await expect(
        createMealPlanning({
          familyId,
          startDate: '2026-01-01',
          endDate: '2026-01-14',
        }),
      ).rejects.toThrow(MealPlanningOverlapError);
    });

    it('should include conflicting planning details in error', async () => {
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      try {
        await createMealPlanning({
          familyId,
          startDate: '2026-01-05',
          endDate: '2026-01-12',
        });
        expect.fail('Should have thrown MealPlanningOverlapError');
      } catch (error) {
        expect(error).toBeInstanceOf(MealPlanningOverlapError);
        const overlapError = error as MealPlanningOverlapError;
        expect(overlapError.conflictingPlannings).toHaveLength(1);
        expect(overlapError.conflictingPlannings[0].startDate).toBe('2026-01-01');
        expect(overlapError.message).toContain('2026-01-01');
      }
    });
  });

  describe('updateMealPlanning', () => {
    it('should update status without overlap check', async () => {
      const planning = await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
        status: 'draft',
      });

      const updated = await updateMealPlanning(planning.id, { status: 'active' });

      expect(updated.status).toBe('active');
    });

    it('should allow updating dates to non-overlapping range', async () => {
      const planning = await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      const updated = await updateMealPlanning(planning.id, {
        startDate: '2026-01-08',
        endDate: '2026-01-14',
      });

      expect(updated.startDate).toBe('2026-01-08');
      expect(updated.endDate).toBe('2026-01-14');
    });

    it('should throw when updating dates to overlap with another planning', async () => {
      // Create two plannings
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      const planning2 = await createMealPlanning({
        familyId,
        startDate: '2026-01-15',
        endDate: '2026-01-21',
      });

      // Try to move planning2 to overlap with planning1
      await expect(
        updateMealPlanning(planning2.id, {
          startDate: '2026-01-05',
          endDate: '2026-01-10',
        }),
      ).rejects.toThrow(MealPlanningOverlapError);
    });

    it('should throw error when planning not found', async () => {
      await expect(updateMealPlanning('non-existent-id', { status: 'active' })).rejects.toThrow(
        'not found',
      );
    });
  });

  describe('findOverlappingMealPlannings', () => {
    it('should return empty array when no overlaps', async () => {
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      const overlaps = await findOverlappingMealPlannings(familyId, '2026-01-15', '2026-01-21');

      expect(overlaps).toHaveLength(0);
    });

    it('should return overlapping plannings', async () => {
      await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      const overlaps = await findOverlappingMealPlannings(familyId, '2026-01-05', '2026-01-12');

      expect(overlaps).toHaveLength(1);
    });

    it('should exclude specified planning ID', async () => {
      const planning = await createMealPlanning({
        familyId,
        startDate: '2026-01-01',
        endDate: '2026-01-07',
      });

      // Same dates but excluding itself - should find no overlap
      const overlaps = await findOverlappingMealPlannings(
        familyId,
        '2026-01-01',
        '2026-01-07',
        planning.id,
      );

      expect(overlaps).toHaveLength(0);
    });
  });
});
