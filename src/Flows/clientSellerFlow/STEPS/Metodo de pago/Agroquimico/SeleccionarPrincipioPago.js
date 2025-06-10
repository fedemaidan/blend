const FlowManager = require('../../../../../FlowControl/FlowManager');
const opcionPrincipio = require('../../../../../Utiles/Chatgpt/opcionPrincipio');

module.exports = async function SeleccionarPrincipioPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { productosParaPago } = flowData;

    if (!productosParaPago || productosParaPago.length === 0) {
        console.error("❌ productosParaPago vacío o indefinido");
        await sock.sendMessage(userId, { text: "❌ No hay productos disponibles para pagar." });
        return;
    }

    const seleccion = await opcionPrincipio(data, productosParaPago.map(p => p.principio_activo));

    const principioPagoRaw = productosParaPago.find(p => {
        const original = p.principio_activo?.nombre?.toLowerCase().replace(/\s+/g, '');
        const seleccionado = seleccion?.nombre?.toLowerCase().replace(/\s+/g, '');
        return original === seleccionado;
    });

    if (!principioPagoRaw) {
        console.error("❌ principio_activo no encontrado:", seleccion?.nombre);
        await sock.sendMessage(userId, {
            text: `❌ No se encontró el principio activo seleccionado para pago.`
        });
        return;
    }
    const principioPago = principioPagoRaw.principio_activo;
    const concentracionesPago = principioPagoRaw.concentraciones || [];

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el principio activo con el que deseas pagar: *${principioPago.nombre}*.`
    });

    const msg = '📊 Ahora elige la concentración para este principio activo:\n' +
        concentracionesPago.map((c, i) => `${i + 1}. *${(c.concentracion * 100).toFixed(2)}%*`).join('\n') +
        '\n\nPor favor, responde con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "VENTA", "SeleccionarConcentracionPago", {
        principioPago,
        concentracionesPago
    });
};
