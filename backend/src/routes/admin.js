const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db.js");
const { requireAuth, allowRoles } = require("../middleware/auth.js");
const { validateUser } = require("../middleware/validate.js");
const { isValidId, publicUser, escapeRegex } = require("../utils/serialize.js");

const router = express.Router();
const BCRYPT_ROUNDS = 12;
const VALID_ROLES = ["buyer", "seller", "admin"];
const users = () => getDb().collection("users");
const movies = () => getDb().collection("movies");

// Todo lo de este archivo es solo para administradores.
router.use(requireAuth, allowRoles("admin"));

const notFound = (res) => res.status(404).json({ error: "Usuario no encontrado." });

router.get("/users", async (req, res, next) => {
  try {
    const filter = {};
    const { q, role } = req.query;
    if (typeof q === "string" && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim().slice(0, 80)), "i");
      filter.$or = [{ username: rx }, { email: rx }];
    }
    if (typeof role === "string" && VALID_ROLES.includes(role)) filter.role = role;

    const list = await users().find(filter, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
    return res.json(list.map(publicUser));
  } catch (error) {
    return next(error);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);
    const user = await users().findOne({ _id: new ObjectId(req.params.id) }, { projection: { passwordHash: 0 } });
    if (!user) return notFound(res);
    return res.json(publicUser(user));
  } catch (error) {
    return next(error);
  }
});

// Crear usuario (el admin puede elegir el rol directamente)
router.post("/users", validateUser(), async (req, res, next) => {
  try {
    const { username, email, password, role } = req.validatedUser;
    const now = new Date();
    const doc = {
      username,
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: role || "buyer",
      createdAt: now,
      updatedAt: now
    };
    const result = await users().insertOne(doc); // el indice unico devuelve 11000 -> 409 en errorHandler
    return res.status(201).json({ ok: true, user: publicUser({ _id: result.insertedId, ...doc }) });
  } catch (error) {
    return next(error);
  }
});

// Editar usuario y/o CAMBIAR SU ROL (buyer <-> seller <-> admin)
router.put("/users/:id", validateUser({ partial: true }), async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);
    const _id = new ObjectId(req.params.id);
    const target = await users().findOne({ _id });
    if (!target) return notFound(res);

    const { password, ...changes } = req.validatedUser;

    if (changes.role && changes.role !== target.role) {
      if (req.user.id === req.params.id) {
        return res.status(409).json({ error: "No puedes cambiar tu propio rol." });
      }
      if (target.role === "admin") {
        const admins = await users().countDocuments({ role: "admin" });
        if (admins <= 1) return res.status(409).json({ error: "Debe existir al menos un administrador." });
      }
    }

    if (password) changes.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    changes.updatedAt = new Date();

    const updated = await users().findOneAndUpdate({ _id }, { $set: changes }, {
      returnDocument: "after",
      projection: { passwordHash: 0 }
    });
    if (!updated) return notFound(res);
    return res.json({ ok: true, user: publicUser(updated) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);
    if (req.user.id === req.params.id) {
      return res.status(409).json({ error: "No puedes eliminar tu propia cuenta." });
    }
    const _id = new ObjectId(req.params.id);
    const target = await users().findOne({ _id });
    if (!target) return notFound(res);

    if (target.role === "admin") {
      const admins = await users().countDocuments({ role: "admin" });
      if (admins <= 1) return res.status(409).json({ error: "Debe existir al menos un administrador." });
    }

    // Las peliculas del usuario eliminado pasan al admin que hizo la accion (no se pierde catalogo).
    await movies().updateMany({ sellerId: _id }, { $set: { sellerId: new ObjectId(req.user.id) } });
    await users().deleteOne({ _id });
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;