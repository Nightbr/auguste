import 'dotenv/config';
import { getDatabase } from '../src/domain/db/index.js';
import { SCHEMA } from '../src/domain/db/schema.js';
import { callMealPlannerAgent } from '../src/ai/agents/index.js';

async function verify() {
  console.log('Starting verification...');
  const db = getDatabase();

  // 1. Initialize DB schema
  try {
    db.exec(SCHEMA);
    console.log('Database initialized.');
  } catch (e) {
    console.error('Failed to init DB:', e);
  }

  // 2. Seed Data
  const familyId = crypto.randomUUID();
  const adultId = crypto.randomUUID();

  db.prepare(`INSERT INTO Family (id, name, country, language) VALUES (?, ?, ?, ?)`).run(familyId, 'Test Family', 'US', 'en');

  db.prepare(
    `INSERT INTO Member (id, familyId, name, type, allergies, foodPreferences, cookingSkillLevel) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(adultId, familyId, 'Alice', 'adult', '["nuts"]', '{"likes":["pasta"]}', 'intermediate');

  db.prepare(`INSERT INTO MemberAvailability (id, memberId, mealType, dayOfWeek, isAvailable) VALUES (?, ?, ?, ?, ?)`).run(
    crypto.randomUUID(),
    adultId,
    'dinner',
    1,
    1
  );

  // Note: activeDays is JSON string '[1]'
  db.prepare(`INSERT INTO PlannerSettings (id, familyId, mealTypes, activeDays) VALUES (?, ?, ?, ?)`).run(
    crypto.randomUUID(),
    familyId,
    '["dinner"]',
    '[1]'
  );

  console.log('Test data seeded.');

  // 3. Run Agent using the helper function
  console.log('Invoking agent...');

  const result = await callMealPlannerAgent('Please create a meal plan for us starting next Monday.', {
    familyId,
  });

  console.log('Agent Response:', result.text);

  // 4. Verify DB side effects
  const plans = db.prepare('SELECT * FROM MealPlanning WHERE familyId = ?').all(familyId);
  console.log('Plans created:', plans.length);

  const events = db.prepare('SELECT * FROM MealEvent WHERE familyId = ?').all(familyId);
  console.log('Events created:', events.length);
  if (events.length > 0) {
    console.log('Sample Event:', events[0]);
  }
}

verify().catch(console.error);
