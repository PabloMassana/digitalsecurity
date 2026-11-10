const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const MAX_BCRYPT_BYTES = 72;
const ALLOWED_MOVIE_FIELDS = new Set([
  "title", "year", "genre", "description", "price", "stock", "image",
  "runtime", "rating", "tagline", "synopsis", "cast"
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validationError(res, details) {
  return res.status(400).json({
    error: "Los datos enviados no son validos.",
    details
  });
}

function validateRegister(req, res, next) {
  const body = req.body || {};
  if (!isObject(body)) return validationError(res, ["El cuerpo debe ser un objeto JSON o formulario valido."]);

  const details = [];
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!USERNAME_REGEX.test(username)) {
    details.push("username debe tener entre 3 y 30 caracteres y solo puede contener letras, numeros, punto, guion o guion bajo.");
  }
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    details.push("email debe ser una direccion de correo valida.");
  }
  // NIST SP 800-63B-4 pide al menos 15 caracteres cuando la contrasena es el unico factor.
  if ([...password].length < 15) {
    details.push("password debe tener al menos 15 caracteres.");
  }
  if (Buffer.byteLength(password, "utf8") > MAX_BCRYPT_BYTES) {
    details.push("password no puede superar 72 bytes UTF-8 por el limite de bcrypt.");
  }
  // El rol se asigna exclusivamente en el servidor; rechaza intentos de autorrol.
  if (Object.prototype.hasOwnProperty.call(body, "role")) {
    details.push("role no puede enviarse durante el registro; se asigna automaticamente.");
  }

  if (details.length) return validationError(res, details);

  req.validatedAuth = { username, email, password };
  next();
}

function validateLogin(req, res, next) {
  const body = req.body || {};
  if (!isObject(body)) return validationError(res, ["El cuerpo debe ser un objeto JSON o formulario valido."]);

  const details = [];
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const identifier = email || username;

  if (!identifier) details.push("Debes enviar email o username.");
  if (!password) details.push("password es obligatorio.");
  if (identifier.length > 254) details.push("El identificador es demasiado largo.");
  if (Buffer.byteLength(password, "utf8") > MAX_BCRYPT_BYTES) {
    details.push("password supera el maximo permitido.");
  }

  if (details.length) return validationError(res, details);

  req.validatedAuth = { identifier, password };
  next();
}

function validateMovie({ partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body || {};
    if (!isObject(body)) return validationError(res, ["El cuerpo debe ser un objeto valido."]);

    const details = [];
    const movie = {};
    const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

    const unknownFields = Object.keys(body).filter((key) => !ALLOWED_MOVIE_FIELDS.has(key));
    if (unknownFields.length) {
      details.push(`Campos no permitidos: ${unknownFields.join(", ")}.`);
    }

    const requiredFields = ["title", "year", "genre", "price", "stock"];
    if (!partial) {
      for (const field of requiredFields) {
        if (body[field] === undefined || String(body[field]).trim() === "") {
          details.push(`${field} es obligatorio.`);
        }
      }
    }

    if (has("title")) {
      if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 150) {
        details.push("title debe ser un texto de 1 a 150 caracteres.");
      } else movie.title = body.title.trim();
    }

    if (has("year")) {
      const year = Number(body.year);
      const maxYear = new Date().getFullYear() + 2;
      if (!Number.isInteger(year) || year < 1888 || year > maxYear) {
        details.push(`year debe ser un numero entero entre 1888 y ${maxYear}.`);
      } else movie.year = year;
    }

    if (has("genre")) {
      if (typeof body.genre !== "string" || !body.genre.trim() || body.genre.trim().length > 80) {
        details.push("genre debe ser un texto de 1 a 80 caracteres.");
      } else movie.genre = body.genre.trim();
    }

    if (has("description")) {
      if (typeof body.description !== "string" || body.description.length > 2000) {
        details.push("description debe ser texto y no superar 2000 caracteres.");
      } else movie.description = body.description.trim();
    }

    if (has("price")) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0 || price > 1000000) {
        details.push("price debe ser un numero entre 0 y 1000000.");
      } else movie.price = price;
    }

    if (has("stock")) {
      const stock = Number(body.stock);
      if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1000000) {
        details.push("stock debe ser un entero entre 0 y 1000000.");
      } else movie.stock = stock;
    }

    if (has("image")) {
      if (typeof body.image !== "string" || body.image.length > 1000) {
        details.push("image debe ser una URL de texto y no superar 1000 caracteres.");
      } else if (body.image.trim()) {
        try {
          const imageUrl = new URL(body.image.trim());
          if (!["http:", "https:"].includes(imageUrl.protocol) || imageUrl.username || imageUrl.password) {
            throw new Error("URL no permitida");
          }
          movie.image = imageUrl.toString();
        } catch {
          details.push("image debe ser una URL valida http o https, sin credenciales.");
        }
      } else {
        movie.image = "";
      }
    }

    for (const [field, maxLength] of [["runtime", 30], ["rating", 12], ["tagline", 180], ["synopsis", 3000]]) {
      if (has(field)) {
        if (typeof body[field] !== "string" || body[field].length > maxLength) {
          details.push(`${field} debe ser texto y no superar ${maxLength} caracteres.`);
        } else movie[field] = body[field].trim();
      }
    }

    if (has("cast")) {
      let cast = body.cast;
      if (typeof cast === "string") {
        try {
          cast = JSON.parse(cast);
        } catch {
          cast = cast.split(",").map((person) => person.trim()).filter(Boolean);
        }
      }
      if (!Array.isArray(cast) || cast.length > 30 || cast.some((person) =>
        typeof person !== "string" || !person.trim() || person.trim().length > 80
      )) {
        details.push("cast debe ser una lista de hasta 30 nombres de maximo 80 caracteres.");
      } else {
        movie.cast = cast.map((person) => person.trim());
      }
    }

    if (partial && Object.keys(movie).length === 0 && details.length === 0) {
      details.push("Debes enviar al menos un campo permitido para actualizar.");
    }

    if (details.length) return validationError(res, details);

    // El esquema se construye desde una lista permitida. sellerId, role, _id y fechas
    // nunca se copian desde req.body.
    req.validatedMovie = movie;
    next();
  };
}

module.exports = { validateRegister, validateLogin, validateMovie };
