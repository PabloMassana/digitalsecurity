const dbname = process.env.APP_DB;
const appDb = db.getSiblingDB(dbname);

appDb.createUser({
    user: process.env.APP_USER,
    pwd: process.env.APP_PASSWORD,
    roles: [{role: "readWrite", db: dbname}],
});