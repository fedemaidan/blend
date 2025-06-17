const FlowManager = require('../../../../../FlowControl/FlowManager');
const opcionConcentracion = require('../../../../../Utiles/Chatgpt/opcionConcentracion');

module.exports = async function SeleccionarConcentracionPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { concentracionespago, principiopago } = flowData;

    const seleccion = await opcionConcentracion(data, concentracionespago);

    if (!seleccion || typeof seleccion.concentracion !== 'number') {
        await sock.sendMessage(userId, {
            text: "❌ No pudimos entender qué concentración seleccionaste. Por favor, intentá de nuevo."
        });
        return;
    }

    const nombrePrincipio = principiopago.principio_activo.nombre;

    const msg = `✅ Has seleccionado el principio activo *${nombrePrincipio}* con una concentración de *${(seleccion.concentracion * 100).toFixed(2)}%*.\n\n💲 ¿En cuánto valúas tu producto por unidad? Por favor, indicá el precio en dólares.`;

    await sock.sendMessage(userId, { text: msg });

    principiopago.principio_activo.concentracion = seleccion.concentracion;

    await FlowManager.setFlow(userId, "COMPRA", "NegociarPrecioPago", {
        productoPago: {
            Pactivo: principiopago.principio_activo,
            precio: parseFloat(principiopago.principio_activo.precio),
            concentracion: seleccion.concentracion,
        }
    });
};
