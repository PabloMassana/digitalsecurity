const bcrypt = require("bcryptjs");
const { getDb } = require("./db.js");

// Crea el primer administrador si no existe ninguno. Se configura con variables de entorno.
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const username = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !username || !password) return;

  const users = getDb().collection("users");
  if (await users.countDocuments({ role: "admin" }, { limit: 1 })) return;

  if ([...password].length < 15) throw new Error("ADMIN_PASSWORD debe tener al menos 15 caracteres.");

  const now = new Date();
  await users.insertOne({
    username,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    createdAt: now,
    updatedAt: now
  });
  console.log(`Administrador inicial "${username}" creado.`);
}

module.exports = seedAdmin;