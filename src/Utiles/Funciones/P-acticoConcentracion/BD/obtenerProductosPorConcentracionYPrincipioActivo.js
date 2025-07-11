const { Concentracion, Product } = require("../../../../models");

module.exports = async function getProductosPorConcentracionYPrincipioActivo(principioActivo, concentracion) {
    
    
    try {
        const productos = await Product.findAll({
            where: { activo: true },
            include: {
                model: Concentracion,
                as: 'concentraciones',
                where: {
                    concentracion: concentracion,
                    id_principio_activo: principioActivo.id,
                },
            },
        });

        return productos.map((producto) => ({
            id: producto.id,
            marca: producto.marca,
            empresa: producto.empresa,
            stock: producto.stock,
            precio: producto.precio,
            precio_maximo: producto.precio_maximo,
            precio_minimo: producto.precio_minimo,
            activos: producto.activos,
            rentabilidad: producto.rentabilidad
        }));
    } catch (error) {
        console.error('Error al obtener productos por concentración y principio activo:', error);
        throw new Error('No se pudieron obtener los productos.');
    }
}