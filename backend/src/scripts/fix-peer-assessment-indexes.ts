import { connect, connection } from 'mongoose';

async function fixPeerAssessmentIndexes() {
  try {
    // Connect to MongoDB
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');

    console.log('Connected to MongoDB');

    // Get the peerassessments collection
    const collection = connection.db.collection('peerassessments');

    // List current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the old indexes that use assessorId and assessedId
    try {
      await collection.dropIndex('assessorId_1_assessedId_1');
      console.log('Dropped assessorId_1_assessedId_1 index');
    } catch (error) {
      console.log('Index assessorId_1_assessedId_1 not found or already dropped');
    }

    // Create new indexes with correct field names
    await collection.createIndex(
      { assessorUserId: 1, assessedUserId: 1 },
      { unique: true }
    );
    console.log('Created assessorUserId_1_assessedUserId_1 unique index');

    await collection.createIndex({ assessedUserId: 1 });
    console.log('Created assessedUserId_1 index');

    await collection.createIndex({ groupId: 1 });
    console.log('Created groupId_1 index');

    // List indexes after changes
    const newIndexes = await collection.indexes();
    console.log('New indexes:', JSON.stringify(newIndexes, null, 2));

    console.log('✅ Successfully fixed peer assessment indexes');

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixPeerAssessmentIndexes();
