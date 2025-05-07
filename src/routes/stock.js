const express = require("express");
const { Product, PrincipioActivo } = require("../../models");
const router = express.Router();

router.post("/principio-activo", async (req, res) => {
  try {
    const { nombre, precio, precio_maximo, alias } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({
        message: "El nombre y el precio son obligatorios",
      });
    }

    // Crear un nuevo principio activo
    const nuevoPrincipioActivo = await PrincipioActivo.create({
      nombre,
      precio,
      precio_maximo,
      alias,
    });

    return res.status(201).json(nuevoPrincipioActivo);
  } catch (error) {
    console.error("Error al agregar el principio activo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/producto", async (req, res) => {
  try {
    const {
      registro,
      registro_senasa,
      registo_inase,
      especie,
      cultivar,
      marca,
      empresa,
      activos,
      banda_toxicologica,
      precio,
      precio_minimo,
      precio_maximo,
      producto_propio,
      stock,
      potencial_proveedor,
      rentabilidad,
      activo,
    } = req.body;

    if (!marca || !precio) {
      return res.status(400).json({
        message: "La marca y el precio son obligatorios",
      });
    }

    const nuevoProducto = await Product.create({
      registro,
      registro_senasa,
      registo_inase,
      especie,
      cultivar,
      marca,
      empresa,
      activos,
      banda_toxicologica,
      precio,
      precio_minimo,
      precio_maximo,
      producto_propio: producto_propio || false,
      stock: stock || 0,
      potencial_proveedor,
      rentabilidad,
      activo: activo || false,
    });

    return res.status(201).json({
      message: "Producto creado exitosamente",
      producto: nuevoProducto,
    });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put("/producto/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (!stock) {
      return res.status(400).json({
        message: "El stock es obligatorio",
      });
    }

    const producto = await Product.findByPk(id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    producto.stock = stock;
    await producto.save();

    return res.status(200).json({
      message: "Stock actualizado exitosamente",
      producto,
    });
  } catch (error) {
    console.error("Error al actualizar el stock del producto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
