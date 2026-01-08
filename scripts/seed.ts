import { eq, and } from 'drizzle-orm';
import { db, schema, generateId } from '../packages/core/src/domain/index.js';

async function seed() {
  console.log('🌱 Seeding database...');

  const familyId = generateId();
  const dadId = generateId();
  const momId = generateId();
  const childId = generateId();

  console.log(`creating Family: "The Auguste Demo Family" (${familyId})`);

  await db.insert(schema.family).values({
    id: familyId,
    name: 'The Auguste Demo Family',
    country: 'FR',
    language: 'en',
  });

  // Members
  console.log('Creating members...');
  await db.insert(schema.member).values([
    {
      id: dadId,
      familyId,
      name: 'Pierre',
      type: 'adult',
      dietaryRestrictions: [],
      foodPreferences: { likes: ['asian', 'spicy', 'steak'], dislikes: ['blue cheese'] },
      cookingSkillLevel: 'intermediate',
    },
    {
      id: momId,
      familyId,
      name: 'Marie',
      type: 'adult',
      dietaryRestrictions: ['vegetarian'],
      foodPreferences: { likes: ['italian', 'salads', 'soup'], dislikes: ['cilantro'] },
      cookingSkillLevel: 'advanced',
    },
    {
      id: childId,
      familyId,
      name: 'Leo',
      type: 'child',
      dietaryRestrictions: [],
      allergies: ['peanuts', 'tree-nuts'],
      foodPreferences: { likes: ['pasta', 'nuggets', 'pizza'], dislikes: ['broccoli', 'spinach'] },
    },
  ]);

  // Planner Settings
  console.log('Creating planner settings...');
  await db.insert(schema.plannerSettings).values({
    id: generateId(),
    familyId,
    mealTypes: ['dinner'],
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    defaultServings: 3,
  });

  // Availability
  console.log('Creating availability...');
  const availabilityData: any[] = [];
  const members = [dadId, momId, childId];
  const days = [0, 1, 2, 3, 4, 5, 6];

  for (const mId of members) {
    for (const d of days) {
      availabilityData.push({
        id: generateId(),
        memberId: mId,
        mealType: 'dinner',
        dayOfWeek: d,
        isAvailable: true,
      });
    }
  }

  await db.insert(schema.memberAvailability).values(availabilityData);

  // Update specific unavailable slots
  // Pierre (Dad) - Tuesday Dinner
  await db
    .update(schema.memberAvailability)
    .set({ isAvailable: false })
    .where(
      and(
        eq(schema.memberAvailability.memberId, dadId),
        eq(schema.memberAvailability.dayOfWeek, 2),
        eq(schema.memberAvailability.mealType, 'dinner'),
      ),
    );

  // Marie (Mom) - Thursday Dinner
  await db
    .update(schema.memberAvailability)
    .set({ isAvailable: false })
    .where(
      and(
        eq(schema.memberAvailability.memberId, momId),
        eq(schema.memberAvailability.dayOfWeek, 4),
        eq(schema.memberAvailability.mealType, 'dinner'),
      ),
    );

  console.log('✅ Seed complete!');
  console.log('------------------------------------------------');
  console.log(`Family ID: ${familyId}`);
  console.log('Use this ID to test the Meal Planner Agent.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
