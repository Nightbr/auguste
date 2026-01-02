import 'dotenv/config';
import { getDatabase } from '../src/domain/db';
import { mealPlannerAgent } from '../src/mastra/agents';
import fs from 'fs';
import path from 'path';

async function verify() {
  console.log('Starting verification...');
  const db = getDatabase();

  // 1. Initialize DB schema
  try {
    const schema = fs.readFileSync(path.join(process.cwd(), 'src/domain/db/schema.sql'), 'utf-8');

    // Split by statement (rough approximation for SQLite)
    const statements = schema.split(';').filter((s) => s.trim().length > 0);
    for (const statement of statements) {
      // Ignore errors if table exists (simple migration)
      try {
        db.prepare(statement).run();
      } catch (e) {
        // console.log('Schema init note:', e.message);
      }
    }
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

  // 3. Run Agent
  console.log('Invoking agent...');

  const resultExplicit = await mealPlannerAgent.generate([
    {
      role: 'user',
      content: `I am the head of the family with ID ${familyId}. Please create a meal plan for us starting next Monday.`,
    },
  ]);

  console.log('Agent Response:', resultExplicit.text);

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
