module.export = async function getConcentracionesAceptados(principioActivo) {
    try {
        const concentraciones = await Concentracion.findAll({
            where: {
                id_principio_activo: principioActivo.id,
            },
            include: {
                model: Product,
                as: 'producto',
                where: {
                    activo: true,
                },
            },
            attributes: ['concentracion'],
            order: [['concentracion', 'ASC']],
        });

        // Mapear los resultados para obtener solo los valores de concentración únicos
        const concentracionesData = [...new Set(concentraciones.map((c) => c.concentracion))];

        return concentracionesData;
    } catch (error) {
        console.error('Error al obtener concentraciones:', error);
        throw new Error('No se pudieron obtener las concentraciones.');
    }
}