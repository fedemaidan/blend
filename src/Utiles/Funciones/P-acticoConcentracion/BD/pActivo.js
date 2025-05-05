const { Product, Concentracion, PrincipioActivo } = require('../../models');

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
                }
            });
            const principiosActivosReducidos = principiosActivos.map(pa => {
                return { id: pa.id, nombre: pa.nombre, alias: pa.alias };
            });
            return principiosActivosReducidos;
        } catch (error) {
            console.error('Error al obtener los principios activos:', error);
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

    async getPrincipiosActivosConStock() {
        try {
            const principiosActivos = await PrincipioActivo.findAll({
                include: {
                    model: Concentracion,
                    as: 'concentraciones',
                    where: {
                        id: { [Op.ne]: null },
                    },
                    include: {
                        model: Product,
                        as: 'producto',
                        where: {
                            stock: { [Op.gt]: 0 },
                        },
                    },
                },
                where: {
                    activo: true,
                },
            });

            const principiosActivosConStock = principiosActivos.map((pa) => {
                return {
                    id: pa.id,
                    nombre: pa.nombre,
                    alias: pa.alias,
                    concentraciones: pa.concentraciones.map((conc) => {
                        return {
                            id: conc.id,
                            concentracion: conc.concentracion,
                            producto: {
                                id: conc.producto.id,
                                marca: conc.producto.marca,
                                empresa: conc.producto.empresa,
                                activos: conc.producto.activos,
                                registro: conc.producto.registro,
                                stock: conc.producto.stock,
                                precio: conc.producto.precio,
                            },
                        };
                    }),
                };
            });

            return principiosActivosConStock;
        } catch (error) {
            console.error('Error al obtener principios activos con stock:', error);
            throw new Error('No se pudieron obtener los principios activos con stock.');
        }
    }

};

module.exports = PrincipioActivoService;
