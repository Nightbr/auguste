import { describe, it, expect, beforeEach } from 'vitest';
import {
  createFamilyTool,
  getFamilyTool,
  updateFamilyTool,
  deleteFamilyTool,
} from './family-tools';
import { db, schema } from '../../domain';

describe('Family Tools', () => {
  beforeEach(async () => {
    // Clean up the table before each test for isolation
    await db.delete(schema.family);
  });

  it('should create a new family', async () => {
    const input = {
      name: 'Test Family',
      country: 'us',
      language: 'EN',
    };

    const result = await createFamilyTool.execute(input);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(input.name);
    expect(result.country).toBe('US'); // Should be uppercased
    expect(result.language).toBe('en'); // Should be lowercased
  });

  it('should get a family by ID', async () => {
    const family = await createFamilyTool.execute({
      name: 'Get Me',
      country: 'FR',
      language: 'fr',
    });

    const result = await getFamilyTool.execute({ id: family.id });

    expect(result.found).toBe(true);
    expect(result.family).toMatchObject({
      id: family.id,
      name: 'Get Me',
      country: 'FR',
      language: 'fr',
    });
  });

  it('should return found=false for non-existent family', async () => {
    const result = await getFamilyTool.execute({ id: '00000000-0000-4000-8000-000000000000' });
    expect(result.found).toBe(false);
  });

  it('should update a family', async () => {
    const family = await createFamilyTool.execute({
      name: 'Old Name',
      country: 'US',
      language: 'en',
    });

    const result = await updateFamilyTool.execute({
      id: family.id,
      name: 'New Name',
      country: 'de',
    });

    expect(result.found).toBe(true);
    expect(result.family?.name).toBe('New Name');
    expect(result.family?.country).toBe('DE'); // Should be uppercased
  });

  it('should update family language independently', async () => {
    const family = await createFamilyTool.execute({
      name: 'Language Test',
      country: 'US',
      language: 'en',
    });

    const result = await updateFamilyTool.execute({
      id: family.id,
      language: 'ES',
    });

    expect(result.found).toBe(true);
    expect(result.family?.language).toBe('es'); // Should be lowercased
  });

  it('should delete a family', async () => {
    const family = await createFamilyTool.execute({
      name: 'Delete Me',
      country: 'DE',
      language: 'de',
    });

    const result = await deleteFamilyTool.execute({ id: family.id });
    expect(result.success).toBe(true);
    expect(result.deletedId).toBe(family.id);

    const check = await getFamilyTool.execute({ id: family.id });
    expect(check.found).toBe(false);
  });

  it('should return found=false when updating non-existent family', async () => {
    const result = await updateFamilyTool.execute({
      id: '00000000-0000-4000-8000-000000000000',
      name: 'Ghost Family',
    });
    expect(result.found).toBe(false);
  });

  it('should return success=false when deleting non-existent family', async () => {
    const result = await deleteFamilyTool.execute({ id: '00000000-0000-4000-8000-000000000000' });
    expect(result.success).toBe(false);
  });
});
