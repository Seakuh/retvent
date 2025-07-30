import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export async function setupTestDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

export async function clearTestDB() {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    await Promise.all(
      Object.values(collections).map(async (collection) => {
        await collection.deleteMany({}); // Clear each collection
      }),
    );
    console.log('Test database cleared'); // Debug log
  }
}

export async function closeTestDB() {
  await mongoose.disconnect();
  await mongod.stop();
}
