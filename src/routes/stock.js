const express = require("express");
const {
  createPrincipioActivo,
  getPrincipioActivoById,
  getPrincipiosActivos,
} = require("../services/Api/principioActivo");
const {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
} = require("../services/Api/product");
const router = express.Router();

router.post("/principio-activo", async (req, res) => {
  try {
    const { nombre, precio, precio_maximo } = req.body;

    if (!nombre || !precio || !precio_maximo) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    const nuevoPrincipioActivo = await createPrincipioActivo(
      nombre,
      precio,
      precio_maximo
    );

    return res.status(201).json(nuevoPrincipioActivo);
  } catch (error) {
    console.error("Error al agregar el principio activo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/principio-activo", async (req, res) => {
  try {
    const principiosActivos = await getPrincipiosActivos();
    return res.status(200).json(principiosActivos);
  } catch (error) {
    console.error("Error al obtener los principios activos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/principio-activo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const principioActivo = await getPrincipioActivoById(id);
    if (!principioActivo) {
      return res
        .status(404)
        .json({ message: "Principio activo no encontrado" });
    }
    return res.status(200).json(principioActivo);
  } catch (error) {
    console.error("Error al obtener el principio activo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/producto", async (req, res) => {
  try {
    const { page } = req.query;

    const result = await getProducts(page);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/producto/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await getProductById(id);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(producto);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
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

// Se agrega o se resta al stock actual del producto
router.put("/producto/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.stock === undefined) {
      return res.status(400).json({
        message: "El stock es obligatorio",
      });
    }

    const productoActual = await getProductById(id);
    if (!productoActual) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const stockIncrementado = {
      ...req.body,
      stock: productoActual.stock + req.body.stock,
    };

    const producto = await updateProduct(id, stockIncrementado);

    return res.status(200).json({
      message: "Stock actualizado exitosamente",
      stockAnterior: productoActual.stock,
      stockAgregado: req.body.stock,
      stockActual: producto.stock,
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
