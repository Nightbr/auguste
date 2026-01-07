import 'dotenv/config';
import { db, schema, generateId } from '../src/domain/index.js';
import { callMealPlannerAgent } from '../src/ai/agents/index.js';
import { eq } from 'drizzle-orm';

async function verify() {
  console.log('Starting verification...');

  // 1. Seed Data
  const familyId = generateId();
  const adultId = generateId();

  await db.insert(schema.family).values({
    id: familyId,
    name: 'Test Family',
    country: 'US',
    language: 'en',
  });

  await db.insert(schema.member).values({
    id: adultId,
    familyId,
    name: 'Alice',
    type: 'adult',
    allergies: ['nuts'],
    foodPreferences: { likes: ['pasta'], dislikes: [] },
    cookingSkillLevel: 'intermediate',
  });

  await db.insert(schema.memberAvailability).values({
    id: generateId(),
    memberId: adultId,
    mealType: 'dinner',
    dayOfWeek: 1,
    isAvailable: true,
  });

  await db.insert(schema.plannerSettings).values({
    id: generateId(),
    familyId,
    mealTypes: ['dinner'],
    activeDays: [1],
  });

  console.log('Test data seeded.');

  // 2. Run Agent
  console.log('Invoking agent...');

  // This will use the Mastra agent which uses tools that we've refactored to use Drizzle
  const result = await callMealPlannerAgent('Please create a meal plan for us starting next Monday.', {
    familyId,
  });

  console.log('Agent Response:', result.text);

  // 3. Verify DB side effects via Drizzle
  const plans = await db.query.mealPlanning.findMany({
    where: eq(schema.mealPlanning.familyId, familyId),
  });
  console.log('Plans created:', plans.length);

  const events = await db.query.mealEvent.findMany({
    where: eq(schema.mealEvent.familyId, familyId),
  });
  console.log('Events created:', events.length);
  if (events.length > 0) {
    console.log('Sample Event:', events[0]);
  }
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
