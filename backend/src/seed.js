const bcrypt = require("bcryptjs");
const { connect, getDb, closeConnection} = require("./db");

const SEED_BUYER_PASSWORD = process.env.SEED_BUYER_PASSWORD;
const SEED_SELLER_PASSWORD = process.env.SEED_SELLER_PASSWORD;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

async function seedUsers(db) {
    const users = [
        {username: "comprador1", email: "c1@mail.com", role: "buyer",  password: SEED_BUYER_PASSWORD },
        {username: "vendedor1", email: "v1@mail.com", role: "seller",  password: SEED_SELLER_PASSWORD },
        {username: "admin1", email: "admin@mail.com", role: "admin",  password: SEED_ADMIN_PASSWORD }
    ];

    for (const u of users) {
        const hashedPassword = await bcrypt.hash(u.password, 12);
        await db.collection("users").updateOne(
            { email: u.email }, 
            {$set: { username: u.username, passwordHash: hashedPassword, role: u.role, updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date() }
        }, 
            { upsert: true }
        );
}
}

async function main(){
    await connect();
    const db = getDb();
    await seedUsers(db);
    await closeConnection();
    console.log("Seed de usuarios listo");
}

main().catch(err => {console.error(err); process.exit(1); });
