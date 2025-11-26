// Quick migration script for peer assessments
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventscanner';

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('peerassessments');

    // Finde alle alten Assessments
    const oldAssessments = await collection.find({
      passiveAggressive: { $exists: false },
      loose: { $exists: true }
    }).toArray();

    console.log(`Found ${oldAssessments.length} old peer assessments to migrate`);

    for (const assessment of oldAssessments) {
      // Konvertiere alte Werte zu neuen
      const passiveAggressive = ((assessment.aggressive - assessment.passive) / 2) + 5;
      const tightLoose = ((assessment.loose - assessment.tight) / 2) + 5;

      console.log(`Migrating assessment ${assessment._id}:`);
      console.log(`  Old: L=${assessment.loose}, T=${assessment.tight}, A=${assessment.aggressive}, P=${assessment.passive}`);
      console.log(`  New: PA=${passiveAggressive.toFixed(1)}, TL=${tightLoose.toFixed(1)}`);

      await collection.updateOne(
        { _id: assessment._id },
        {
          $set: {
            passiveAggressive: Math.max(0, Math.min(10, passiveAggressive)),
            tightLoose: Math.max(0, Math.min(10, tightLoose))
          },
          $unset: {
            loose: '',
            tight: '',
            aggressive: '',
            passive: ''
          }
        }
      );
    }

    console.log('✅ Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
