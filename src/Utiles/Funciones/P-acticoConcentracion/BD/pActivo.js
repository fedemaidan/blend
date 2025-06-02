const { Product, Concentracion, PrincipioActivo } = require('../../../../../models');
const { Op } = require("sequelize");
const PrincipioActivoService = {
    // Recalcular precios de todos los productos asociados a un principio activo
    async recalcularPrecios(principioActivo) {
        if (!principioActivo || !principioActivo.id) {
            throw new Error('Se debe proporcionar un principio activo válido.');
        }

        try {
            // Obtener todas las concentraciones asociadas al principio activo
            const concentraciones = await Concentracion.findAll({
                where: { id_principio_activo: principioActivo.id },
                include: { model: Product, as: 'producto' }
            });

            const productosActualizados = [];

            for (const concentracion of concentraciones) {
                const producto = concentracion.producto;

                if (producto) {
                    // Calcular el nuevo precio del producto basado en todas las concentraciones asociadas
                    const concentracionesProducto = await Concentracion.findAll({
                        where: { id_producto: producto.id },
                        include: { model: PrincipioActivo, as: 'principioActivo' }
                    });

                    const nuevoPrecio = concentracionesProducto.reduce((acc, conc) => {
                        return acc + (conc.principioActivo.precio * conc.concentracion);
                    }, 0);

                    // Actualizar el precio del producto en la base de datos
                    await producto.update({
                        precio: nuevoPrecio,
                        precio_maximo: nuevoPrecio * 1.1,
                        precio_minimo: nuevoPrecio * 0.9
                    });

                    productosActualizados.push({
                        id: producto.id,
                        nuevoPrecio,
                        precio_maximo: nuevoPrecio * 1.1,
                        precio_minimo: nuevoPrecio * 0.9
                    });
                }
            }

            console.log(`Precios recalculados para ${productosActualizados.length} productos.`);
            return productosActualizados;
        } catch (error) {
            console.error('Error al recalcular precios:', error);
            throw new Error('No se pudo recalcular los precios de los productos.');
        }
    },

async obtenerPrincipiosActivos() {
  try {
    const principiosActivos = await PrincipioActivo.findAll({
      where: {
        activo: true
      },
      include: {
        model: Concentracion,
        as: 'concentraciones',
        attributes: ['id', 'concentracion'],
        required: true,
        include: {
          model: Product,
          as: 'producto',
          attributes: ['id', 'producto_propio', 'activo'],
          where: {
            producto_propio: false,
            activo: true
          },
          required: true
        }
      }
    });

    const mapPorNombre = new Map();

    for (const pa of principiosActivos) {
      const nombre = pa.nombre.trim();

      if (!mapPorNombre.has(nombre)) {
        mapPorNombre.set(nombre, {
          id: pa.id,
          nombre: pa.nombre,
          alias: pa.alias,
          precio: parseFloat(pa.precio),
          precio_maximo: pa.precio_maximo ? parseFloat(pa.precio_maximo) : null,
          concentraciones: []
        });
      }

      const entry = mapPorNombre.get(nombre);

      for (const conc of pa.concentraciones || []) {
        const key = parseFloat(conc.concentracion);
        const esPropio = conc.producto?.producto_propio;

        if (!entry.concentraciones.some(c => c.concentracion === key)) {
          entry.concentraciones.push({
            id: conc.id,
            concentracion: key,
            producto_propio: esPropio
          });
        }
      }
    }

    return Array.from(mapPorNombre.values());
  } catch (error) {
    console.error('❌ Error al obtener los principios activos:', error);
    throw error;
  }
},

    async obtenerProductos() {
        try {
            const productos = await Product.findAll({
                where: {
                    activo: true,
                    // stock: { [Op.gt]: 0 }
                }
            });
            const productosReducidos = productos.map(prod => {
                return { id: prod.id, marca: prod.marca, empresa: prod.empresa, activos: prod.activos, registro: prod.registro, precio: prod.precio };
            });
            return productosReducidos;
        } catch (error) {
            console.error('Error al obtener los principios activos:', error);
            throw error;
        }
    },

    
};

module.exports = PrincipioActivoService;
