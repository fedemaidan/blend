const express = require("express");
const { Oferta } = require("../../models");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const { estado } = req.query;

    if (!estado) {
      const ofertas = Oferta.findAll();
      return res.status(200).json(ofertas);
    }

    if (estado !== "pendiente" && estado !== "aceptada") {
      return res.status(400).json({
        message: "El estado solo puede ser 'pendiente' o 'aceptada'",
      });
    }
    const ofertas = Oferta.findAll({
      where: {
        estado,
      },
    });
    return res.status(200).json(ofertas);
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
