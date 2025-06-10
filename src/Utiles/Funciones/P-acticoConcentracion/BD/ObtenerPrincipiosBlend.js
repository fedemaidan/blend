const { PrincipioActivo, Concentracion, Product } = require('../../../../../models');

module.exports = async function ObtenerPrincipiosBlend() {
    try {
        const principiosBlend = await PrincipioActivo.findAll({
            where: {
                activo: true
            },
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

        const items = [];

        principiosBlend.forEach(pa => {
            pa.concentraciones.forEach(conc => {
                const prod = conc.producto;
                items.push({
                    producto: prod,
                    principio: pa.nombre,
                    concentracion: conc.concentracion,
                    marca: prod.marca,
                    empresa: prod.empresa,
                    id_producto: prod.id,
                    id_concentracion: conc.id,
                    precio: prod.precio,
                    precio_maximo: prod.precio_maximo,
                    stock: prod.stock,
                    rentabilidad: prod.rentabilidad,
                    producto_propio: prod.producto_propio,
                    activo: prod.activo
                });
            });
        });

        return items;

    } catch (error) {
        console.error('❌ Error al obtener principios activos de blend:', error);
        throw new Error('No se pudo obtener la información de blend.');
    }
};