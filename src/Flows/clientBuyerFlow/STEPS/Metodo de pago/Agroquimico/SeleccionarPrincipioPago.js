const FlowManager = require('../../../../../FlowControl/FlowManager');
const opcionPrincipio = require('../../../../../Utiles/Chatgpt/opcionPrincipio');

module.exports = async function SeleccionarPrincipioPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { principioscompra } = flowData;

    // GPT devuelve solo el nombre u objeto parcial
    const seleccionado = await opcionPrincipio(data, principioscompra);

    // Buscar el objeto completo desde principioscompra
    const principiocompra = principioscompra.find(p => p.nombre === seleccionado.nombre);

    if (!principiocompra) {
        await sock.sendMessage(userId, {
            text: `❌ No se encontró el principio activo seleccionado.`
        });
        console.error("❌ principio no encontrado en la lista original:", seleccionado);
        return;
    }

    console.log("📦 Principio activo seleccionado (completo):", principiocompra);

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el principio activo para pago: *${principiocompra.nombre}*.`
    });

    const concentracionescompra = principiocompra.concentraciones || [];

    const msg = '📊 Ahora elige la concentración para este principio activo. Estas son las opciones:\n' +
        concentracionescompra.map((c, i) => `${i + 1}. *${(c.concentracion * 100).toFixed(2)}%*`).join('\n') +
        '\n\nPor favor, responde con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "COMPRA", "SeleccionarConcentracionPago", {
        principiocompra,
        concentracionescompra
    });
};
