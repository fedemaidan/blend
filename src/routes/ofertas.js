const express = require("express");
const {
  getAllOfertas,
  getOfertasByEstado,
  getOfertaById,
  updateOferta,
  createOferta, // Añadir esta importación
} = require("../services/Api/oferta");
const {
  getProductById,
  updateProduct,
  getProductByRegistro,
} = require("../services/Api/product");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      productos_ofrecidos,
      productos_recibidos,
      numero_telefono_cliente,
      rentabilidad,
      valor_total_recibido,
      valor_total_ofertado,
      ganancia_final,
    } = req.body;

    if (!productos_ofrecidos || !productos_ofrecidos) {
      return res.status(400).json({
        message:
          "Los productos ofrecidos y/o recibidos son obligatorios y deben ser un array",
      });
    }

    const nuevaOferta = await createOferta({
      productos_ofrecidos,
      productos_recibidos: productos_recibidos || [],
      numero_telefono_cliente,
      rentabilidad,
      valor_total_recibido,
      valor_total_ofertado,
      ganancia_final,
    });

    return res.status(201).json({
      message: "Oferta creada exitosamente",
      oferta: nuevaOferta,
    });
  } catch (error) {
    console.error("Error al crear la oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { estado } = req.query;

    let ofertas;
    if (!estado) {
      ofertas = await getAllOfertas();
    } else {
      if (estado !== "activo" && estado !== "pendiente") {
        return res.status(400).json({
          message: "El estado debe ser 'activo' o 'pendiente'",
        });
      }
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

    const oferta = await getOfertaById(id);

    if (!oferta) {
      return res.status(404).json({ message: "Oferta no encontrada" });
    }

    if (estado === "aceptada" && impactaEnStock) {
      if (oferta.productos_ofrecidos) {
        for (const producto of oferta.productos_ofrecidos) {
          const { registro, cantidad } = producto;

          if (!registro || cantidad <= 0) continue;

          const productoActual = await getProductByRegistro(registro);
          const nuevoStock = productoActual.stock - cantidad;
          const productoActualizado = await updateProduct(productoActual.id, {
            stock: nuevoStock,
          });
        }
      }

      if (oferta.productos_recibidos) {
        for (const producto of oferta.productos_recibidos) {
          const { registro, cantidad } = producto;

          const productoActual = await getProductByRegistro(registro);
          const nuevoStock = productoActual.stock + cantidad;
          const productoActualizado = await updateProduct(productoActual.id, {
            stock: nuevoStock,
          });
        }
      }
    }

    await oferta.update({ estado });

    return res.status(200).json({
      message: "Oferta actualizada exitosamente",
      oferta,
      impactoEnStock: estado === "aceptada" && impactaEnStock ? true : false,
    });
  } catch (error) {
    console.error("Error al actualizar la oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
