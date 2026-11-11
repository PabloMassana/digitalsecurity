const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("node:crypto");
const { rateLimit } = require("express-rate-limit");
const { getDb } = require("../db.js");
const { validateRegister, validateLogin } = require("../middleware/validate.js");
const { JWT_ISSUER, JWT_AUDIENCE } = require("../middleware/auth.js");

const router = express.Router();
const BCRYPT_ROUNDS = 12;
const JWT_ALGORITHM = "HS256";

// Basic per-IP protection. For multiple API instances, configure a shared store (e.g. Redis).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta nuevamente dentro de 15 minutos." }
});

// A dummy hash keeps the expensive bcrypt comparison for unknown users too,
// reducing timing-based account discovery. This is generated once per process.
const DUMMY_PASSWORD_HASH = bcrypt.hash(randomBytes(32).toString("hex"), BCRYPT_ROUNDS);

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 bytes aleatorios.");
  }

  return jwt.sign(
    { sub: user._id.toString() },
    secret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  };
}

router.post("/register", authLimiter, validateRegister, async (req, res, next) => {
  try {
    const { username, email, password } = req.validatedAuth;
    const users = getDb().collection("users");

    const existingUser = await users.findOne({ $or: [{ email }, { username }] }, { projection: { _id: 1 } });
    if (existingUser) {
      return res.status(409).json({ error: "El correo o nombre de usuario ya esta registrado." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const now = new Date();
    const newUser = {
      username,
      email,
      passwordHash,
      role: "buyer",
      createdAt: now,
      updatedAt: now
    };

    const result = await users.insertOne(newUser);
    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente. Ya puedes iniciar sesion.",
      user: publicUser({ _id: result.insertedId, ...newUser })
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", authLimiter, validateLogin, async (req, res, next) => {
  try {
    const { identifier, password } = req.validatedAuth;
    const users = getDb().collection("users");
    const user = await users.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    const comparisonHash = user && typeof user.passwordHash === "string"
      ? user.passwordHash
      : await DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt.compare(password, comparisonHash);

    if (!user || !passwordMatches || !["buyer", "seller", "admin"].includes(user.role)) {
      return res.status(401).json({ error: "Credenciales invalidas." });
    }

    const token = createToken(user);
    return res.status(200).json({
      token,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
