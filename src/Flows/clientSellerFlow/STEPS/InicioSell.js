const FlowManager = require('../../../FlowControl/FlowManager');
const { getPrincipiosActivosAceptadosVenta } = require('../../../Utiles/Funciones/P-acticoConcentracion/obtenerPrincipio');

module.exports = async function InicioSell(userId, data, sock) {

    await sock.sendMessage(userId, { text: '🔄 ¡Genial! Te mostraremos los principios activos disponibles para Vender.' });

    const Principios = await getPrincipiosActivosAceptadosVenta();

    if (!Principios || Principios.length === 0) {
        await sock.sendMessage(userId, {
            text: "❌ No hay principios activos con stock disponible en este momento."
        });
        FlowManager.resetFlow(userId);
        return;
    }

 const msg = '📋 Aquí están los principios activos en los cuales nos puedes pagar:\n' +
    Principios.map((p, i) => `${i + 1}. ${p.principio_activo.nombre}`).join('\n') +
    '\n\nPor favor, responde con el número de tu elección.';


    await sock.sendMessage(userId, { text: msg });

    FlowManager.setFlow(userId, "VENTA", "seleccionarPrincipio", { Principios, flow: "VENTA"});
};
