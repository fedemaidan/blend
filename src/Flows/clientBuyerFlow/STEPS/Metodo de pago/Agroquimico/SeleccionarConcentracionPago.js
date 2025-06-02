const FlowManager = require('../../../../../FlowControl/FlowManager');
const opcionConcentracion = require('../../../../../Utiles/Chatgpt/opcionConcentracion');

module.exports = async function SeleccionarConcentracionPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { concentracionescompra, principiocompra } = flowData;

    const seleccion = await opcionConcentracion(data, concentracionescompra);

    
    if (!seleccion || typeof seleccion.concentracion !== 'number') {
        await sock.sendMessage(userId, {
            text: "❌ No pudimos entender qué concentración seleccionaste. Por favor, intentá de nuevo."
        });
        return;
    }

    const msg = `✅ Has seleccionado el principio activo *${principiocompra.nombre}* con una concentración de *${(seleccion.concentracion * 100).toFixed(2)}%*.\n\n💲 ¿En cuánto valúas tu producto por unidad? Por favor, indicá el precio en dólares.`;

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "COMPRA", "NegociarPrecioPago", {
        principiocompra,
        concentracioncompra: seleccion
    });
};
