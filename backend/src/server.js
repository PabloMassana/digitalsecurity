const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const express = require("express");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { connect, closeConnection } = require("./db.js");
const authRoutes = require("./routes/auth.js");
const errorHandler = require("./middleware/errorHandler.js");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

function validateConfiguration() {
  const secret = process.env.JWT_SECRET || "";
  if (Buffer.byteLength(secret, "utf8") < 32 || /reemplaza|cambiar|change[-_ ]?me/i.test(secret)) {
    throw new Error("Configura JWT_SECRET con un secreto aleatorio de al menos 32 bytes antes de iniciar.");
  }
  if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
    throw new Error("Configura MONGODB_URI y DB_NAME antes de iniciar.");
  }
}

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "64kb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "64kb", parameterLimit: 20 }));

// CORS: permitir solo el origen de frontend declarado en .env. No se usan cookies.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.ALLOWED_ORIGIN;

  if (origin && allowedOrigin && origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

// General API limit; auth routes add a stricter shared per-IP limit.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta nuevamente mas tarde." }
});
app.use("/api", apiLimiter);

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada." }));
app.use(errorHandler);

let httpServer;

async function shutdown(signal) {
  console.log(`Recibida senal ${signal}; cerrando backend.`);
  if (httpServer) {
    httpServer.close(async () => {
      try {
        await closeConnection();
        process.exit(0);
      } catch (error) {
        console.error("Error al cerrar MongoDB:", error);
        process.exit(1);
      }
    });
  } else {
    await closeConnection();
    process.exit(0);
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

try {
  validateConfiguration();
  connect()
    .then(() => {
      console.log("Base de datos conectada correctamente.");
      httpServer = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Backend escuchando en el puerto ${PORT}.`);
      });
      httpServer.requestTimeout = 30_000;
      httpServer.headersTimeout = 15_000;
      httpServer.keepAliveTimeout = 5_000;
    })
    .catch((error) => {
      console.error("No se pudo iniciar el backend:", error.message);
      process.exit(1);
    });
} catch (error) {
  console.error("Configuracion insegura o incompleta:", error.message);
  process.exit(1);
}
