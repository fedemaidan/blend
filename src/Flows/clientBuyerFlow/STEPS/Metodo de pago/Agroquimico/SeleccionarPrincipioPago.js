const FlowManager = require('../../../../../FlowControl/FlowManager');

module.exports = async function SeleccionarPrincipioPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { principiosPago } = flowData;

    console.log("📦 Principios disponibles para selección:", principiosPago.map(p => p.principio_activo.nombre));

    const index = parseInt(data) - 1;

    if (isNaN(index) || index < 0 || index >= principiosPago.length) {
        await sock.sendMessage(userId, {
            text: `❌ Entrada no válida. Por favor, respondé con el número correspondiente a tu elección.`
        });
        console.error("❌ Índice fuera de rango o inválido:", data);
        return;
    }

    const principiocompra = principiosPago[index];

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el principio activo para pago: *${principiocompra.principio_activo.nombre}*.`
    });

    const concentracionescompra = principiocompra.concentraciones || [];

    if (concentracionescompra.length === 0) {
        await sock.sendMessage(userId, {
            text: '⚠️ Este principio activo no tiene concentraciones disponibles. Seleccioná otro, por favor.'
        });
        return;
    }

    const msg = '📊 Ahora elige la concentración para este principio activo. Estas son las opciones:\n' +
        concentracionescompra.map((c, i) => `${i + 1}. *${(c.concentracion * 100).toFixed(2)}%*`).join('\n') +
        '\n\nPor favor, respondé con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "COMPRA", "SeleccionarConcentracionPago", {
        principiopago: principiocompra,
        concentracionespago: concentracionescompra
    });
};
