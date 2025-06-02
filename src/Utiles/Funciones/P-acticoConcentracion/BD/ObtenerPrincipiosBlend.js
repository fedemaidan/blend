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

        // Formato plano: cada ítem representa un producto con su principio y concentración
        const items = [];

        principiosBlend.forEach(pa => {
            pa.concentraciones.forEach(conc => {
                items.push({
                    producto: conc.producto.activos,
                    principio: pa.nombre,
                    concentracion: conc.concentracion,
                    marca: conc.producto.marca,
                    empresa: conc.producto.empresa,
                    id_producto: conc.producto.id,
                    id_concentracion: conc.id
                });
            });
        });

        return items;

    } catch (error) {
        console.error('❌ Error al obtener principios activos de blend:', error);
        throw new Error('No se pudo obtener la información de blend.');
    }
};
