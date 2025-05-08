const express = require("express");
const { createPrincipioActivo } = require("../services/Api/principioActivo");
const {
  createProduct,
  updateProduct,
  getProducts,
} = require("../services/Api/product");
const router = express.Router();

router.post("/principio-activo", async (req, res) => {
  try {
    const { nombre, precio, precio_maximo, alias } = req.body;

    if (!nombre || !precio || !precio_maximo || !alias) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    const nuevoPrincipioActivo = await createPrincipioActivo(
      nombre,
      precio,
      precio_maximo,
      alias
    );

    return res.status(201).json(nuevoPrincipioActivo);
  } catch (error) {
    console.error("Error al agregar el principio activo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/producto", async (req, res) => {
  try {
    const productos = await getProducts();

    return res.status(200).json(productos);
  } catch (err) {
    console.error("Error al obtener los productos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/producto", async (req, res) => {
  try {
    if (!req.body.marca || !req.body.precio) {
      return res.status(400).json({
        message: "La marca y el precio son obligatorios",
      });
    }

    const newProduct = await createProduct(req.body);

    return res.status(201).json({
      message: "Producto creado exitosamente",
      producto: newProduct,
    });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put("/producto/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.stock === undefined) {
      return res.status(400).json({
        message: "El stock es obligatorio",
      });
    }

    const producto = await updateProduct(id, req.body);

    return res.status(200).json({
      message: "Producto actualizado exitosamente",
      producto,
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);

    if (error.message === "Producto no encontrado") {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
