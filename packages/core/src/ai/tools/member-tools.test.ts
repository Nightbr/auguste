import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMemberTool,
  getMembersTool,
  getMemberTool,
  getMemberByNameTool,
  updateMemberTool,
  deleteMemberTool,
} from './member-tools';
import { createFamilyTool } from './family-tools';
import { db, schema, MemberType } from '../../domain';

describe('Member Tools', () => {
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

  it('should create a new member', async () => {
    const input = {
      familyId,
      name: 'Jean',
      type: MemberType.adult as any,
      birthdate: { day: 1, month: 1, year: 1980 },
      dietaryRestrictions: ['vegetarian'],
    };

    const result = await createMemberTool.execute(input);

    expect(result).toBeDefined();
    expect(result.name).toBe(input.name);
    expect(result.birthdate).toEqual(input.birthdate);
    expect(result.dietaryRestrictions).toContain('vegetarian');
  });

  it('should create a member with null birthdate (bug fix verification)', async () => {
    const input = {
      familyId,
      name: 'No Birthdate',
      type: MemberType.adult as any,
      birthdate: null,
    };

    const result = await createMemberTool.execute(input);
    expect(result.birthdate).toBeNull();
  });

  it('should get all members of a family', async () => {
    await createMemberTool.execute({ familyId, name: 'Jean', type: MemberType.adult as any });
    await createMemberTool.execute({ familyId, name: 'Marie', type: MemberType.adult as any });

    const result = await getMembersTool.execute({ familyId });
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.name)).toContain('Jean');
    expect(result.map((m) => m.name)).toContain('Marie');
  });

  it('should get a single member by ID', async () => {
    const member = await createMemberTool.execute({
      familyId,
      name: 'Jean',
      type: MemberType.adult as any,
    });
    const result = await getMemberTool.execute({ id: member.id });
    expect(result.found).toBe(true);
    expect(result.member?.id).toBe(member.id);
  });

  it('should search for a member by name (case-insensitive)', async () => {
    await createMemberTool.execute({ familyId, name: 'Titouan', type: MemberType.child as any });

    const result = await getMemberByNameTool.execute({ familyId, name: 'titou' });
    expect(result.found).toBe(true);
    expect(result.member?.name).toBe('Titouan');
  });

  it('should update a member (including birthdate)', async () => {
    const member = await createMemberTool.execute({
      familyId,
      name: 'Jean',
      type: MemberType.adult as any,
      birthdate: { day: 1, month: 1, year: 1980 },
    });

    const result = await updateMemberTool.execute({
      id: member.id,
      name: 'Jean Updated',
      birthdate: null,
    });

    expect(result.found).toBe(true);
    expect(result.member?.name).toBe('Jean Updated');
    expect(result.member?.birthdate).toBeNull();
  });

  it('should update other member fields independently', async () => {
    const member = await createMemberTool.execute({
      familyId,
      name: 'Independent',
      type: MemberType.adult as any,
    });

    const result = await updateMemberTool.execute({
      id: member.id,
      type: MemberType.child as any,
      dietaryRestrictions: ['None'],
      allergies: ['Peanuts'],
      foodPreferencesLikes: ['pizza'],
      foodPreferencesDislikes: [],
      cookingSkillLevel: 'intermediate' as any,
    });

    expect(result.found).toBe(true);
    expect(result.member?.type).toBe(MemberType.child);
    expect(result.member?.dietaryRestrictions).toContain('None');
    expect(result.member?.allergies).toContain('Peanuts');
    expect(result.member?.foodPreferencesLikes).toContain('pizza');
    expect(result.member?.cookingSkillLevel).toBe('intermediate');
  });

  it('should delete a member', async () => {
    const member = await createMemberTool.execute({
      familyId,
      name: 'Delete Me',
      type: MemberType.adult as any,
    });
    const result = await deleteMemberTool.execute({ id: member.id });
    expect(result.success).toBe(true);

    const check = await getMemberTool.execute({ id: member.id });
    expect(check.found).toBe(false);
  });

  it('should return found=false for non-existent member (get)', async () => {
    const result = await getMemberTool.execute({ id: '00000000-0000-4000-8000-000000000000' });
    expect(result.found).toBe(false);
  });

  it('should return found=false for non-existent member (search)', async () => {
    const result = await getMemberByNameTool.execute({ familyId, name: 'Ghost' });
    expect(result.found).toBe(false);
  });

  it('should return found=false for non-existent member (update)', async () => {
    const result = await updateMemberTool.execute({
      id: '00000000-0000-4000-8000-000000000000',
      name: 'New Name',
    });
    expect(result.found).toBe(false);
  });

  it('should return success=false for non-existent member (delete)', async () => {
    const result = await deleteMemberTool.execute({ id: '00000000-0000-4000-8000-000000000000' });
    expect(result.success).toBe(false);
  });
});
