const FlowManager = require('../../../../FlowControl/FlowManager');
const opcionPrincipio = require('../../../Utiles/Chatgpt/opcionPrincipio');
const  getConcentraciones  = require('../../../../../Utiles/Funciones/P-acticoConcentracion/obtenerConcentracion');

module.exports = async function SeleccionarPrincipioPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { principioscompra } = flowData;

    principiocompra = await opcionPrincipio(data, principioscompra)

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el principio activo para pago: *${principiocompra.nombre}*.`
    });

    let concentracionescompra = await getConcentraciones(principiocompra);

    if (typeof concentracionescompra === "string") {
        concentracionescompra = concentracionescompra.split(",").map(Number);
    } else if (Array.isArray(concentracionescompra)) {
        concentracionescompra = concentracionescompra.map(Number);
    }

    concentracionescompra = [...new Set(concentracionescompra)].sort((a, b) => a - b);

    const msg = '📊 Ahora elige el producto con su concentración para este principio activo. Estas son las opciones:\n' +
        concentracionescompra.map((c, i) => `${i + 1}.  *${(c * 100).toFixed(2)}%*`).join('\n') +
        '\n\nPor favor, responde con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "COMPRA", "SeleccionarConcentracionPago", {principiocompra,concentracionescompra});
};
