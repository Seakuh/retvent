const { MongoClient } = require('mongodb');

async function dropOldIndexes() {
  // MongoDB URI from .env
  const uri = 'mongodb://admin:SehrSicher123!@167.235.200.242:27017';

  console.log('Connecting to MongoDB...');
  console.log('URI:', uri.replace(/:[^:]*@/, ':****@'));
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('test');
    const collection = db.collection('peerassessments');

    // List current indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the problematic old indexes
    try {
      await collection.dropIndex('assessorId_1_assessedId_1');
      console.log('✅ Dropped old index: assessorId_1_assessedId_1');
    } catch (e) {
      console.log('ℹ️  Index assessorId_1_assessedId_1 not found or already dropped');
    }

    try {
      await collection.dropIndex('assessedId_1');
      console.log('✅ Dropped old index: assessedId_1');
    } catch (e) {
      console.log('ℹ️  Index assessedId_1 not found or already dropped');
    }

    // Create new indexes
    await collection.createIndex(
      { assessorUserId: 1, assessedUserId: 1 },
      { unique: true }
    );
    console.log('✅ Created new unique index: assessorUserId_1_assessedUserId_1');

    await collection.createIndex({ assessedUserId: 1 });
    console.log('✅ Created new index: assessedUserId_1');

    await collection.createIndex({ groupId: 1 });
    console.log('✅ Created new index: groupId_1');

    // List indexes after changes
    const newIndexes = await collection.indexes();
    console.log('📋 New indexes:', JSON.stringify(newIndexes, null, 2));

    console.log('\n🎉 Successfully fixed all peer assessment indexes!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

dropOldIndexes();
