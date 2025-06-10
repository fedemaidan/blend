const FlowManager = require('../../../FlowControl/FlowManager');
const opcionPrincipio = require('../../../Utiles/Chatgpt/opcionPrincipio');

module.exports = async function seleccionarPrincipio(userId, data, sock) {
    const { PrincipiosClieVen } = FlowManager.userFlows[userId]?.flowData;

    const seleccionGPT = await opcionPrincipio(data, PrincipiosClieVen);

    if (!seleccionGPT || !seleccionGPT.nombre) {
        await sock.sendMessage(userId, { text: "❌ No entendimos tu elección. Por favor, respondé con el número o nombre del principio activo." });
        return;
    }

    const PrincipioClieVen = seleccionGPT;
    const concentraciones = PrincipioClieVen.concentraciones || [];

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el principio activo: *${PrincipioClieVen.nombre}*.`
    });

    const msg = '📊 Elige la concentración disponible para este principio activo. Estas son las opciones:\n' +
        concentraciones.map((c, i) => `${i + 1}. ${(c.concentracion * 100).toFixed(2)}%`).join('\n') +
        '\n\nPor favor, respondé con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    FlowManager.setFlow(userId, "VENTA", "seleccionarConcentracion", {
        PrincipioClieVen,
        concentraciones
    });
};