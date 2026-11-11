const { MongoClient } = require("mongodb");

let client;
let db;

async function connect() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.DB_NAME;

  if (!uri) throw new Error("Falta configurar MONGODB_URI.");
  if (!databaseName) throw new Error("Falta configurar DB_NAME.");

  client = new MongoClient(uri, {
    maxPoolSize: 20,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  db = client.db(databaseName);

  // Restricciones de unicidad: también protegen frente a dos registros simultáneos.
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("movies").createIndex({ createdAt: -1, _id: -1 }),
    db.collection("movies").createIndex({ genre: 1, year: 1 })
  ]);

  return db;
}

function getDb() {
  if (!db) throw new Error("La base de datos no esta conectada.");
  return db;
}

async function closeConnection() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}

module.exports = { connect, getDb, closeConnection };
