const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db.js");

const JWT_ISSUER = "digitalsecurity-api";
const JWT_AUDIENCE = "digitalsecurity-app";
const VALID_ROLES = new Set(["buyer", "seller", "admin"]);

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  const token = match && match[1];

  if (!token || token.length > 4096) {
    return res.status(401).json({ error: "Debes iniciar sesion con un token Bearer valido." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    return next(new Error("JWT_SECRET no esta configurado correctamente."));
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });

    if (!payload.sub || !ObjectId.isValid(payload.sub) || !Number.isInteger(payload.exp) || !Number.isInteger(payload.iat)) {
      return res.status(401).json({ error: "Token invalido." });
    }

    getDb().collection("users").findOne(
      { _id: new ObjectId(payload.sub) },
      { projection: { passwordHash: 0 } }
    ).then((user) => {
      if (!user || !VALID_ROLES.has(user.role)) {
        return res.status(401).json({ error: "La cuenta asociada al token no existe o no es valida." });
      }

      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      };
      return next();
    }).catch(next);
  } catch (error) {
    if (["TokenExpiredError", "JsonWebTokenError", "NotBeforeError"].includes(error.name)) {
      return res.status(401).json({ error: "Token invalido o vencido. Inicia sesion nuevamente." });
    }
    return next(error);
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Debes iniciar sesion." });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permisos para realizar esta accion." });
    }
    return next();
  };
}

module.exports = { requireAuth, allowRoles, JWT_ISSUER, JWT_AUDIENCE };
