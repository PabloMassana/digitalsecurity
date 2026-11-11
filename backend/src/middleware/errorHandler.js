function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error && error.code === 11000) {
    return res.status(409).json({ error: "El correo o nombre de usuario ya esta registrado." });
  }

  // No se devuelve error.message al cliente: puede contener datos internos.
  if (error && error.type === "entity.too.large") {
    return res.status(413).json({ error: "La solicitud supera el tamano permitido." });
  }
  if (error && (error.type === "entity.parse.failed" || error.name === "MulterError")) {
    return res.status(400).json({ error: "El cuerpo de la solicitud no es valido o supera los limites permitidos." });
  }

  const status = Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;

  if (status >= 500) console.error(error);
  return res.status(status).json({
    error: status >= 500 ? "Ocurrio un error interno en el servidor." : "La solicitud no es valida."
  });
}

module.exports = errorHandler;
