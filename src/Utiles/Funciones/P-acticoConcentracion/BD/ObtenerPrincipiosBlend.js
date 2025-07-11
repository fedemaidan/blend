const { PrincipioActivo, Concentracion, Product } = require('../../../../../models');

module.exports = async function ObtenerPrincipiosBlend() {
  try {
    const principiosBlend = await PrincipioActivo.findAll({
      where: { activo: true },
      include: {
        model: Concentracion,
        as: 'concentraciones',
        required: true,
        include: {
          model: Product,
          as: 'producto',
          where: {
            producto_propio: true,
            activo: true
          },
          required: true
        }
      },
      order: [
        ['nombre', 'ASC'],
        [{ model: Concentracion, as: 'concentraciones' }, { model: Product, as: 'producto' }, 'activos', 'ASC']
      ]
    });

    const principiosMap = new Map();

    for (const principio of principiosBlend) {
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
        const rentabilidad = conc.producto?.rentabilidad ?? null;

        if (!agrupado.concentraciones.has(valor)) {
          agrupado.concentraciones.set(valor, {
            id: conc.id,
            concentracion: valor,
            rentabilidad: rentabilidad
          });
        }
      }
    }

    return Array.from(principiosMap.values()).map(pa => ({
      principio_activo: pa.principio_activo,
      concentraciones: Array.from(pa.concentraciones.values())
    }));
  } catch (error) {
    console.error('❌ Error al obtener principios activos de blend:', error);
    throw new Error('No se pudo obtener la información de blend.');
  }
};