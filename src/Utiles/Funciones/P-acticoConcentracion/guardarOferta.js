const { Oferta } = require('../../../../models');

module.exports = async function guardarOferta(ofertaData) {
    try {
        const nuevaOferta = await Oferta.create(ofertaData);
        console.log("✅ Oferta guardada con éxito:", nuevaOferta.id);
        return nuevaOferta;
    } catch (error) {
        console.error("❌ Error al guardar la oferta:", error);
        throw error;
    }
};