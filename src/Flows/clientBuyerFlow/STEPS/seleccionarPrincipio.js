const FlowManager = require('../../../FlowControl/FlowManager');
const opcionPrincipio = require('../../../Utiles/Chatgpt/opcionPrincipio');

module.exports = async function seleccionarPrincipio(userId, data, sock) {
    const { principios } = FlowManager.userFlows[userId]?.flowData;

    // Mostrar lista solo de principios activos al modelo
    const soloPrincipios = principios.map(p => p.principio_activo);

    // Obtener selección del usuario desde GPT (sin id)
    const seleccionGPT = await opcionPrincipio(data, soloPrincipios);

    // Buscar el objeto completo con ID desde la lista original
    const seleccionadoCompleto = principios.find(p =>
        p.principio_activo.nombre.trim().toLowerCase() === seleccionGPT.nombre.trim().toLowerCase()
    );

    if (!seleccionadoCompleto) {
        await sock.sendMessage(userId, { text: "❌ No se encontró el principio activo seleccionado. Intentá nuevamente." });
        return;
    }

    const principioReal = seleccionadoCompleto.principio_activo;
    const concentraciones = seleccionadoCompleto.concentraciones || [];

    // ✅ Mostrar al usuario qué seleccionó
    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el principio activo: *${principioReal.nombre}*.`
    });

    const msg = '📊 Elige la concentración disponible para este principio activo. Estas son las opciones:\n' +
        concentraciones.map((c, i) => `${i + 1}. ${(c.concentracion * 100).toFixed(2)}%`).join('\n') +
        '\n\nPor favor, respondé con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    FlowManager.setFlow(userId, "COMPRA", "seleccionarConcentracion", {
        principioSeleccionado: principioReal, // ✅ tiene ID
        concentraciones
    });
};