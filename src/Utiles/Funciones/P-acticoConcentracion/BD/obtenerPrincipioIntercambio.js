const { Op } = require('sequelize');
const { PrincipioActivo, Concentracion, Product } = require('../../../../../models');

module.exports = async function obtenerPrincipioIntercambio() {
  try {
    const principios = await PrincipioActivo.findAll({
      where: { activo: true },
      include: {
        model: Concentracion,
        as: 'concentraciones',
        required: true,
        include: {
          model: Product,
          as: 'producto',
          where: {
            activo: true,
            producto_propio: false // 🔥 EXCLUYE productos propios
          },
          required: true
        }
      }
    });

    const principiosMap = new Map();

    for (const principio of principios) {
      const nombre = principio.nombre.trim();

      if (!principiosMap.has(nombre)) {
        principiosMap.set(nombre, {
          principio_activo: {
            id: principio.id,
            nombre: principio.nombre,
            alias: principio.alias,
            precio: principio.precio,
            precio_maximo: principio.precio_maximo,
            activo: principio.activo,
            createdAt: principio.createdAt,
            updatedAt: principio.updatedAt
          },
          concentraciones: new Map()
        });
      }

      const agrupado = principiosMap.get(nombre);

      for (const conc of principio.concentraciones || []) {
        const valor = parseFloat(conc.concentracion);
        if (!agrupado.concentraciones.has(valor)) {
          agrupado.concentraciones.set(valor, {
            id: conc.id,
            concentracion: valor
          });
        }
      }
    }

    return Array.from(principiosMap.values()).map(pa => ({
      principio_activo: pa.principio_activo,
      concentraciones: Array.from(pa.concentraciones.values())
    }));
  } catch (error) {
    console.error("❌ Error al obtener principios activos (sin productos propios):", error);
    throw new Error("No se pudieron obtener los principios activos para el intercambio.");
  }
};