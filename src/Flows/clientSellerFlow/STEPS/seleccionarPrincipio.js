const FlowManager = require('../../../FlowControl/FlowManager');
const opcionPrincipio = require('../../../Utiles/Chatgpt/opcionPrincipio');

module.exports = async function seleccionarPrincipio(userId, data, sock) {
    const { Principios } = FlowManager.userFlows[userId]?.flowData;

    // 🔧 Transformar la estructura para que cada opción tenga .nombre en la raíz
    const opcionesPrincipios = Principios.map(p => ({
        ...p.principio_activo,
        concentraciones: p.concentraciones
    }));

    const seleccionGPT = await opcionPrincipio(data, opcionesPrincipios);

    if (!seleccionGPT || !seleccionGPT.nombre) {
        await sock.sendMessage(userId, {
            text: "❌ No entendimos tu elección. Por favor, respondé con el número o nombre del principio activo."
        });
        return;
    }

    const PrincipioSeleccionado = seleccionGPT;
    const concentraciones = PrincipioSeleccionado.concentraciones || [];

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el principio activo: *${PrincipioSeleccionado.nombre}*.`
    });

    const msg = '📊 Elige la concentración disponible para este principio activo. Estas son las opciones:\n' +
        concentraciones.map((c, i) => `${i + 1}. ${(c.concentracion * 100).toFixed(2)}%`).join('\n') +
        '\n\nPor favor, respondé con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "VENTA", "seleccionarConcentracion", {
        PrincipioSeleccionado,
        concentraciones
    });
};
