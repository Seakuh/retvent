// Lösche alte Peer-Assessments (ohne passiveAggressive/tightLoose)
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventscanner';

async function deleteOld() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Lösche alte Peer-Assessments
    const result1 = await db.collection('peerassessments').deleteMany({
      passiveAggressive: { $exists: false }
    });
    console.log(`Deleted ${result1.deletedCount} old peer assessments`);

    console.log('✅ Cleanup completed!');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await client.close();
  }
}

deleteOld();
