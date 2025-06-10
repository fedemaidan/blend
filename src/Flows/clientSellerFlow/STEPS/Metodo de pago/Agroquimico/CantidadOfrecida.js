const FlowManager = require('../../../../../FlowControl/FlowManager');
const mostrarBlend = require('../../../../../Utiles/Funciones/mostrarBlend');

module.exports = async function cantidadYpago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;

    const cantidad = parseFloat(data);
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(userId, { text: "❌ Por favor, ingresa una *cantidad válida de unidades*." });
        return;
    }

    await sock.sendMessage(userId, {
        text: `✅ Perfecto. Registramos ${cantidad} unidad(es) del producto propio para pagar.`
    });

    await FlowManager.setFlow(userId, "VENTA", "eleccionBlend", {
        ...flowData,
        totalParaPagar: cantidad
    });

    await mostrarBlend(userId, sock);
};
