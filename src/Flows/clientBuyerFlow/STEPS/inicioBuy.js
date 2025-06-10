const FlowManager = require('../../../FlowControl/FlowManager');
const { getPrincipiosActivosDisponibles } = require('../../../Utiles/Funciones/P-acticoConcentracion/obtenerPrincipio');

module.exports = async function inicioBuy(userId, data, sock) {
    const principios = await getPrincipiosActivosDisponibles();

    principios.forEach((p, index) => {
        const pa = p.principio_activo;
        p.concentraciones.forEach(conc => {
            console.log(`   - Concentración: ${conc.concentracion} (ID: ${conc.id || 'N/A'})`);
        });
    });

    if (!principios || principios.length === 0) {
        await sock.sendMessage(userId, {
            text: "❌ No hay principios activos con stock disponible en este momento."
        });
        FlowManager.resetFlow(userId);
        return;
    }
    const msg = '📊 Primero, selecciona el principio activo que deseas adquirir. Estos son los que ofertamos actualmente:\n' +
        principios.map((p, i) => `${i + 1}. ${p.principio_activo.nombre}`).join('\n') +
        '\n\nPor favor, responde con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    FlowManager.setFlow(userId, "COMPRA", "seleccionarPrincipio", { principios });
};
