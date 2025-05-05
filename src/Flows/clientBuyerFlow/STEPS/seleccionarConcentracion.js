const FlowManager = require('../../../../FlowControl/FlowManager');
const opcionConcentracion = require('../../../Utiles/Chatgpt/opcionConcentracion');

module.exports = async function CrearRuta(userId, data, sock) {
    const { concentraciones } = FlowManager.userFlows[userId]?.flowData;

    const concentracion = await opcionConcentracion(data, concentraciones);

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado la concentración: *${(concentracion.concentracion * 100).toFixed(2)}%*. Ahora vamos al siguiente paso.`
    });

    const msg = `⚠️ Los pedidos son armados en base a su concentración y principio activo, por lo cual un pedido puede tener más de una marca.\n\n📦 ¿Cuántas unidades (litros, kilos, gramos, packs) quieres adquirir? Por favor, responde con la cantidad.`;
    await sock.sendMessage(userId, { text: msg });

    // ✅ Solo actualiza la concentración seleccionada sin perder los datos anteriores
    FlowManager.setFlow(userId, "COMPRA", "ConfirmarOModificarRuta", {concentracionSeleccionada: concentracion});
};