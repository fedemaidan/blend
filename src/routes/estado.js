const express = require("express");
const router = express.Router();
const socketSingleton = require('../services/SockSingleton/sockSingleton');

router.get("/", async (req, res) => {
  const sock = await socketSingleton.getSock();

  const estaConectado = !!(sock?.state?.connection === 'open');

  res.json({
    conectado: estaConectado,
    numero: sock?.user?.id || null,
    plataforma: sock?.user?.platform || null,
  });
});

module.exports = router;
