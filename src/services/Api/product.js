const { Product } = require("../../../models");

const getProducts = async () => {
  const products = await Product.findAll();

  return products;
};

const getProductById = async (id) => {
  const producto = await Product.findOne({
    where: {
      id,
    },
  });

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  return producto;
};

const getProductByRegistro = async (registro) => {
  const producto = await Product.findOne({
    where: {
      registro,
    },
  });

  return producto;
};

const createProduct = async (productData) => {
  const dataWithDefaults = {
    ...productData,
    producto_propio: productData.producto_propio || false,
    stock: productData.stock || 0,
  };

  const nuevoProducto = await Product.create(dataWithDefaults);

  return nuevoProducto;
};

const updateProduct = async (id, updateData) => {
  const producto = await Product.findOne({
    where: { id },
  });

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  await producto.update(updateData);
  await producto.reload();

  return producto;
};

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  getProductByRegistro,
};
