const express = require("express");
const {
  getAllOfertas,
  getOfertasByEstado,
  getOfertaById,
} = require("../services/Api/oferta");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { estado } = req.query;

    if (estado !== "activo" && estado !== "pendiente") {
      return res.status(400).json({
        message: "El estado debe ser 'activo' o 'pendiente'",
      });
    }

    let ofertas;

    if (!estado) {
      ofertas = await getAllOfertas();
    } else {
      ofertas = await getOfertasByEstado(estado);
    }

    return res.status(200).json(ofertas);
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const oferta = await getOfertaById(id);

    if (!oferta) {
      return res.status(404).json({ message: "Oferta no encontrada" });
    }

    return res.status(200).json(oferta);
  } catch (error) {
    console.error("Error al obtener la oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, impactaEnStock } = req.body;

    if (!estado) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }

    if (estado === "aceptada" && impactaEnStock !== undefined) {
    }

    const oferta = await getOfertaById(id);

    if (!oferta) {
      return res.status(404).json({ message: "Oferta no encontrada" });
    }

    await oferta.update({ estado });

    return res.status(200).json(oferta);
  } catch (error) {
    console.error("Error al actualizar la oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
