import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export const setupTestDB = async () => {
  try {
    // In-Memory MongoDB Server starten
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Verbindung herstellen
    await mongoose.connect(uri);
    
    // Sicherstellen, dass die DB leer ist
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('DB Setup failed:', error);
    throw error;
  }
};

export const clearTestDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('Test database cleared');
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
};

export const closeTestDB = async () => {
  if (mongoose.connection) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
}; 