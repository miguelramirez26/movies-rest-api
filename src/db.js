const { MongoClient } = require('mongodb');

const mongoClient = new MongoClient(process.env.MONGO_URI);
let database;

async function connectToDatabase() {
  if (!database) {
    await mongoClient.connect();
    database = mongoClient.db();
    await ensureCollection(process.env.MOVIES_COLLECTION);
    await ensureCollection(process.env.REVIEWS_COLLECTION);
  }

  return database;
}

async function ensureCollection(collectionName) {
  try {
    await database.createCollection(collectionName);
  } catch (error) {
    if (error.codeName !== 'NamespaceExists') throw error;
  }
}

async function closeDatabaseConnection() {
  await mongoClient.close();
  database = undefined;
}

module.exports = { closeDatabaseConnection, connectToDatabase };