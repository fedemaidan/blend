const FlowManager = require('../../../../../FlowControl/FlowManager');
const opcionConcentracion = require('../../../../../Utiles/Chatgpt/opcionConcentracion');

module.exports = async function SeleccionarConcentracionPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { concentracionesPago, principioPago } = flowData;

    const seleccion = await opcionConcentracion(data, concentracionesPago);

    if (!seleccion || typeof seleccion.concentracion !== 'number') {
        await sock.sendMessage(userId, {
            text: "❌ No se pudo interpretar la concentración. Por favor, intentá de nuevo."
        });
        return;
    }

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado *${principioPago.nombre}* con *${(seleccion.concentracion * 100).toFixed(2)}%* de concentración.`
    });

        await sock.sendMessage(userId, {
        text: `📦 ¿Cuántas unidades querés de *${principioPago.nombre}*?`
    });

    await FlowManager.setFlow(userId, "VENTA", "CantidadOfrecida", {
        principioPago,
        concentracionPago: seleccion
    });
};
