const { MongoClient } = require("mongodb");

let client;
let db;

async function connect() {

	if (db) return db;
	client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	db = client.db(process.env.DB_NAME);
	return db;

}

function getDb() {
	if(!db) throw new Error("La base de datos no esta conectada");
	return db;
}

module.exports = { connect, getDb };


