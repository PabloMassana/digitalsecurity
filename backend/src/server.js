const express = require('express');
const { connect } = require("./db.js");
const app = express();
const PORT = 5000;

app.get('/health', (req, res) => {
    res.json({status: "ok"});
});

connect().then(() => {
    console.log("Base de datos conectada con exito");
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
}).catch((err) => {
    console.error("La base de datos no se pudo conectar", err.message);
    process.exit(1);
});


