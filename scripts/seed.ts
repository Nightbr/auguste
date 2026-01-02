import { getDatabase, toJson } from '../src/domain/db';

async function seed() {
  console.log('🌱 Seeding database...');
  const db = getDatabase();

  // 1. Initialize DB schema (in case it's fresh)
  try {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'src/domain/db/schema.sql');

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schema.split(';').filter((s) => s.trim().length > 0);
      for (const statement of statements) {
        try {
          db.prepare(statement).run();
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {
    console.error('Schema init warning:', e);
  }

  // 2. Clear existing demo data (optional, but good for idempotency if we use fixed IDs or names)
  // For now, let's just create a new family every time but log the ID

  const familyId = crypto.randomUUID();
  const dadId = crypto.randomUUID();
  const momId = crypto.randomUUID();
  const childId = crypto.randomUUID();

  console.log(`creating Family: "The Auguste Demo Family" (${familyId})`);

  db.prepare(`INSERT INTO Family (id, name, country, language) VALUES (?, ?, ?, ?)`).run(familyId, 'The Auguste Demo Family', 'FR', 'en');

  // Members
  // Dad: Likes Asian food, no allergies, intermediate cook
  db.prepare(
    `
    INSERT INTO Member (id, familyId, name, type, allergies, foodPreferences, cookingSkillLevel) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    dadId,
    familyId,
    'Pierre',
    'adult',
    toJson([]),
    toJson({ likes: ['asian', 'spicy', 'steak'], dislikes: ['blue cheese'] }),
    'intermediate'
  );

  // Mom: Vegetarian, likes Italian
  db.prepare(
    `
    INSERT INTO Member (id, familyId, name, type, dietaryRestrictions, foodPreferences, cookingSkillLevel) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    momId,
    familyId,
    'Marie',
    'adult',
    toJson(['vegetarian']),
    toJson({ likes: ['italian', 'salads', 'soup'], dislikes: ['cilantro'] }),
    'advanced'
  );

  // Child: Nut allergy, picky
  db.prepare(
    `
    INSERT INTO Member (id, familyId, name, type, allergies, foodPreferences) 
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(
    childId,
    familyId,
    'Leo',
    'child',
    toJson(['peanuts', 'tree-nuts']),
    toJson({ likes: ['pasta', 'nuggets', 'pizza'], dislikes: ['broccoli', 'spinach'] })
  );

  // Planner Settings
  // Dinner every day (0-6), Lunch on weekends (0, 6)
  const mealTypes = ['dinner'];
  // Just dinner for simplicity in defaults, but let's say they want lunch on weekends too?
  // The schema allows global meal types. Let's strictly stick to Dinner for now to keeps tests simple.
  const activeDays = [0, 1, 2, 3, 4, 5, 6]; // All days

  db.prepare(
    `
    INSERT INTO PlannerSettings (id, familyId, mealTypes, activeDays, defaultServings) 
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(
    crypto.randomUUID(),
    familyId,
    toJson(['dinner']),
    toJson(activeDays),
    3 // 3 members
  );

  // Availability
  // Everyone home for dinner usually
  // Pierre works late Tuesdays (Day 2) -> Not available
  // Marie has Yoga Thursdays (Day 4) -> Not available

  const members = [dadId, momId, childId];
  const days = [0, 1, 2, 3, 4, 5, 6];

  const insertAvail = db.prepare(`
    INSERT INTO MemberAvailability (id, memberId, mealType, dayOfWeek, isAvailable) 
    VALUES (?, ?, ?, ?, ?)
  `);

  // Default everyone available
  for (const mId of members) {
    for (const d of days) {
      insertAvail.run(crypto.randomUUID(), mId, 'dinner', d, 1);
    }
  }

  // Update specific unavailable slots
  // Pierre (Dad) - Tuesday Dinner
  db.prepare(`UPDATE MemberAvailability SET isAvailable = 0 WHERE memberId = ? AND dayOfWeek = 2 AND mealType = 'dinner'`).run(dadId);

  // Marie (Mom) - Thursday Dinner
  db.prepare(`UPDATE MemberAvailability SET isAvailable = 0 WHERE memberId = ? AND dayOfWeek = 4 AND mealType = 'dinner'`).run(momId);

  console.log('✅ Seed complete!');
  console.log('------------------------------------------------');
  console.log(`Family ID: ${familyId}`);
  console.log('Use this ID to test the Meal Planner Agent.');
}

seed().catch(console.error);
