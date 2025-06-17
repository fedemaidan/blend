const FlowManager = require('../../../../../FlowControl/FlowManager');
const mostrarBlend = require('../../../../../Utiles/Funciones/mostrarBlend')
module.exports = async function cantidadYpago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;

    // ✅ Validación de cantidad
    const cantidad = parseFloat(data);
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(userId, { text: "❌ Por favor, ingresa una *cantidad válida de unidades*." });
        return;
    }

    await sock.sendMessage(userId, {
        text: `✅ Perfecto, ${cantidad} unidad(es) del principio activo seleccionado.\n\n🛒`
    });

    await FlowManager.setFlow(userId, "BLEND", "eleccionBlend", {...flowData, cantpago: cantidad});

    await mostrarBlend(userId,sock)
};
