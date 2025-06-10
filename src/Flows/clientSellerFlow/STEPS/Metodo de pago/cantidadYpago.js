const FlowManager = require('../../../../FlowControl/FlowManager');

module.exports = async function cantidadYpago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { PrincipioClieVen, concentracionSeleccionada, precio } = flowData;

    const cantidad = parseFloat(data);
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(userId, { text: "❌ Por favor, ingresa una *cantidad válida de unidades*." });
        return;
    }

    const valorConcentracion = parseFloat(concentracionSeleccionada?.concentracion);
    if (isNaN(valorConcentracion)) {
        await sock.sendMessage(userId, {
            text: "❌ Ocurrió un error al interpretar la concentración seleccionada. Volvé a elegir el producto."
        });
        return;
    }

    await sock.sendMessage(userId, {
        text: `✅ Perfecto. ${cantidad} unidad(es) del principio activo seleccionado.\n\n🛒 ¿Quieres que te paguemos con otro agroquímico?\n\n1. Sí\n2. No`
    });

    FlowManager.setFlow(userId, "VENTA", "eleccionMetodo", {
        ...flowData,
        totalUnidades: cantidad
    });
};