import { db, schema, generateId, now } from '../src/domain/index.js';
import { eq } from 'drizzle-orm';

async function verify() {
  console.log('--- Drizzle Verification ---');

  // 1. Create a family
  const familyId = generateId();
  console.log(`Creating family ${familyId}...`);
  await db.insert(schema.family).values({
    id: familyId,
    name: 'Verification Family',
    country: 'FR',
    language: 'fr',
  });

  // 2. Query the family
  console.log('Querying family...');
  const family = await db.query.family.findFirst({
    where: eq(schema.family.id, familyId),
  });

  if (family && family.name === 'Verification Family') {
    console.log('✅ Family created and retrieved successfully');
  } else {
    console.error('❌ Failed to retrieve family');
    process.exit(1);
  }

  // 3. Create a member with JSON fields
  const memberId = generateId();
  console.log(`Creating member ${memberId}...`);
  await db.insert(schema.member).values({
    id: memberId,
    familyId: familyId,
    name: 'Jean Drizzle',
    type: 'adult',
    birthdate: null,
    dietaryRestrictions: ['vegetarian'],
    foodPreferences: { likes: ['cheese'], dislikes: ['tofu'] },
  });

  // 4. Query member and check JSON
  console.log('Querying member...');
  const member = await db.query.member.findFirst({
    where: eq(schema.member.id, memberId),
  });

  if (member && member.dietaryRestrictions?.includes('vegetarian') && member.foodPreferences?.likes.includes('cheese')) {
    console.log('✅ Member created and JSON fields parsed successfully');
    console.log('JSON content:', JSON.stringify(member.foodPreferences));
  } else {
    console.error('❌ Failed to retrieve member or parse JSON fields');
    console.error('Retrieved:', member);
    process.exit(1);
  }

  // 5. Cleanup
  console.log('Cleaning up...');
  await db.delete(schema.family).where(eq(schema.family.id, familyId));

  const deletedFamily = await db.query.family.findFirst({
    where: eq(schema.family.id, familyId),
  });

  if (!deletedFamily) {
    console.log('✅ Cleanup successful');
  } else {
    console.warn('⚠️ Cleanup failed to remove family');
  }

  console.log('--- Verification Complete ---');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
