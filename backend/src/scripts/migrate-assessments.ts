/**
 * Migration Script: Alte 4-dimensionale Assessments zu neuen 2-dimensionalen Assessments
 *
 * Alte Struktur:
 * - loose: 1-10
 * - tight: 1-10
 * - aggressive: 1-10
 * - passive: 1-10
 *
 * Neue Struktur:
 * - passiveAggressive: 0-10 (0 = passiv, 10 = aggressiv)
 * - tightLoose: 0-10 (0 = tight, 10 = loose)
 *
 * Konvertierung:
 * - passiveAggressive = (aggressive - passive) / 2 + 5  (normalisiert auf 0-10)
 * - tightLoose = (loose - tight) / 2 + 5  (normalisiert auf 0-10)
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventscanner';

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // 1. Migriere PeerAssessments
    console.log('\n=== Migrating PeerAssessments ===');
    const peerAssessments = await db.collection('peerassessments').find({}).toArray();
    console.log(`Found ${peerAssessments.length} peer assessments`);

    for (const assessment of peerAssessments) {
      // Check if already migrated (has passiveAggressive field)
      if ('passiveAggressive' in assessment) {
        console.log(`Skipping already migrated peer assessment ${assessment._id}`);
        continue;
      }

      // Check if has old structure
      if (!('loose' in assessment) || !('aggressive' in assessment)) {
        console.log(`Skipping peer assessment ${assessment._id} - no old structure found`);
        continue;
      }

      // Convert old values to new values
      const passiveAggressive = Math.max(0, Math.min(10,
        ((assessment.aggressive - assessment.passive) / 2 + 5)
      ));
      const tightLoose = Math.max(0, Math.min(10,
        ((assessment.loose - assessment.tight) / 2 + 5)
      ));

      console.log(`Migrating peer assessment ${assessment._id}:`);
      console.log(`  Old: loose=${assessment.loose}, tight=${assessment.tight}, aggressive=${assessment.aggressive}, passive=${assessment.passive}`);
      console.log(`  New: passiveAggressive=${passiveAggressive.toFixed(1)}, tightLoose=${tightLoose.toFixed(1)}`);

      await db.collection('peerassessments').updateOne(
        { _id: assessment._id },
        {
          $set: {
            passiveAggressive: Math.round(passiveAggressive * 10) / 10,
            tightLoose: Math.round(tightLoose * 10) / 10,
          },
          $unset: {
            loose: '',
            tight: '',
            aggressive: '',
            passive: '',
          },
        },
      );
    }

    console.log('✅ PeerAssessments migration completed');

    // 2. Qdrant zu MongoDB Migration (falls Qdrant-Daten existieren)
    console.log('\n=== Info: Qdrant to MongoDB Migration ===');
    console.log('Falls du Qdrant-Daten hast, musst du diese manuell nach MongoDB migrieren.');
    console.log('Das neue System speichert SelfAssessments direkt in MongoDB (selfassessments collection).');
    console.log('Qdrant wird nicht mehr verwendet.');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
