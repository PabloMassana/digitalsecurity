const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db.js");
const { requireAuth, allowRoles } = require("../middleware/auth.js");
const { validateMovie } = require("../middleware/validate.js");
const { upload, removeUploadedFile } = require("../middleware/upload.js");
const { isValidId, publicMovie, escapeRegex } = require("../utils/serialize.js");

const router = express.Router();
const movies = () => getDb().collection("movies");

function notFound(res) {
  return res.status(404).json({ error: "Pelicula no encontrada." });
}

// ---------- PUBLICO: catalogo y detalle (buyer, seller, admin y visitantes) ----------
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    const { q, genre, decade } = req.query;

    if (typeof q === "string" && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim().slice(0, 80)), "i");
      filter.$or = [{ title: rx }, { genre: rx }];
    }
    if (typeof genre === "string" && genre.trim()) filter.genre = genre.trim();
    if (typeof decade === "string" && /^\d{4}$/.test(decade)) {
      const start = Number(decade);
      filter.year = { $gte: start, $lte: start + 9 };
    }

    const list = await movies().find(filter).sort({ createdAt: -1, _id: -1 }).limit(200).toArray();
    return res.json(list.map(publicMovie));
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);
    const movie = await movies().findOne({ _id: new ObjectId(req.params.id) });
    if (!movie) return notFound(res);
    return res.json(publicMovie(movie));
  } catch (error) {
    return next(error);
  }
});

// ---------- SELLER y ADMIN: publicar ----------
router.post("/", requireAuth, allowRoles("seller", "admin"), upload, validateMovie(), async (req, res, next) => {
  try {
    const now = new Date();
    const doc = {
      ...req.validatedMovie,
      sellerId: new ObjectId(req.user.id), // siempre sale del token, nunca del body
      createdAt: now,
      updatedAt: now
    };
    if (req.file) doc.image = "/uploads/" + req.file.filename;

    const result = await movies().insertOne(doc);
    return res.status(201).json({ ok: true, movie: publicMovie({ _id: result.insertedId, ...doc }) });
  } catch (error) {
    if (req.file) removeUploadedFile("/uploads/" + req.file.filename);
    return next(error);
  }
});

// ---------- SELLER (solo las suyas) y ADMIN (todas): editar ----------
router.put("/:id", requireAuth, allowRoles("seller", "admin"), upload, validateMovie({ partial: true }), async (req, res, next) => {
  const newImage = req.file ? "/uploads/" + req.file.filename : null;
  try {
    if (!isValidId(req.params.id)) return notFound(res);
    const _id = new ObjectId(req.params.id);

    const current = await movies().findOne({ _id });
    if (!current) return notFound(res);
    if (req.user.role !== "admin" && String(current.sellerId) !== req.user.id) {
      return res.status(403).json({ error: "Solo puedes modificar tus propias peliculas." });
    }

    const changes = { ...req.validatedMovie, updatedAt: new Date() };
    if (newImage) changes.image = newImage;

    const ownerFilter = req.user.role === "admin" ? { _id } : { _id, sellerId: new ObjectId(req.user.id) };
    const result = await movies().findOneAndUpdate(ownerFilter, { $set: changes }, { returnDocument: "after" });
    if (!result) return res.status(403).json({ error: "Solo puedes modificar tus propias peliculas." });

    if (newImage && current.image && current.image !== newImage) removeUploadedFile(current.image);
    return res.json({ ok: true, movie: publicMovie(result) });
  } catch (error) {
    if (newImage) removeUploadedFile(newImage);
    return next(error);
  }
});

// ---------- SELLER (solo las suyas) y ADMIN (todas): eliminar ----------
router.delete("/:id", requireAuth, allowRoles("seller", "admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);
    const _id = new ObjectId(req.params.id);

    const current = await movies().findOne({ _id });
    if (!current) return notFound(res);
    if (req.user.role !== "admin" && String(current.sellerId) !== req.user.id) {
      return res.status(403).json({ error: "Solo puedes eliminar tus propias peliculas." });
    }

    await movies().deleteOne({ _id });
    removeUploadedFile(current.image);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;