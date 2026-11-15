const path = require("node:path");
const fs = require("node:fs");
const { randomBytes } = require("node:crypto");
const multer = require("multer");

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// La extension sale del tipo MIME validado, nunca del nombre que manda el cliente.
const EXT_BY_MIME = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, randomBytes(16).toString("hex") + EXT_BY_MIME[file.mimetype])
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 20, fieldSize: 64 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!EXT_BY_MIME[file.mimetype]) {
      const err = new Error("Solo se permiten imagenes JPG, PNG o WEBP.");
      err.name = "MulterError";
      return cb(err);
    }
    cb(null, true);
  }
});

function removeUploadedFile(imagePath) {
  if (typeof imagePath !== "string" || !imagePath.startsWith("/uploads/")) return;
  const file = path.join(UPLOAD_DIR, path.basename(imagePath));
  fs.unlink(file, () => {});
}

module.exports = { upload: upload.single("image"), UPLOAD_DIR, removeUploadedFile };