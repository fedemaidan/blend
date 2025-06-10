const FlowManager = require('../../../FlowControl/FlowManager');
const { getPrincipiosActivosAceptadosVenta } = require('../../../Utiles/Funciones/P-acticoConcentracion/obtenerPrincipio');

module.exports = async function InicioSell(userId, data, sock) {

    await sock.sendMessage(userId, { text: '🔄 ¡Genial! Te mostraremos los principios activos disponibles para Vender.' });

    const PrincipiosClieVen = await getPrincipiosActivosAceptadosVenta();

    if (!PrincipiosClieVen || PrincipiosClieVen.length === 0) {
        await sock.sendMessage(userId, {
            text: "❌ No hay principios activos con stock disponible en este momento."
        });
        FlowManager.resetFlow(userId);
        return;
    }

    const msg = '📋 Aquí están los principios activos en los cuales nos puedes vender:\n' +
        PrincipiosClieVen.map((p, i) => `${i + 1}. ${p.nombre}`).join('\n') +
        '\n\nPor favor, responde con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    FlowManager.setFlow(userId, "VENTA", "seleccionarPrincipio", { PrincipiosClieVen });
};
