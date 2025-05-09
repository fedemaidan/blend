const { Product } = require("../../../models");

const getProducts = async (page = null) => {
  const pageSize = 2; // Tamaño de página fijo

  if (page === null || page === undefined) {
    const products = await Product.findAll({
      order: [["id", "ASC"]],
    });

    return {
      products,
      pagination: {
        total: products.length,
        pageSize: products.length,
        totalPages: 1,
      },
    };
  }

  const currentPage = Math.max(1, parseInt(page));
  const offset = (currentPage - 1) * pageSize;

  const { count, rows: products } = await Product.findAndCountAll({
    limit: pageSize,
    offset: offset,
    order: [["id", "ASC"]],
  });

  const totalPages = Math.ceil(count / pageSize);

  return {
    products,
    pagination: {
      total: count,
      currentPage,
      pageSize,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
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
