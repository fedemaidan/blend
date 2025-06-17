const FlowManager = require('../../../FlowControl/FlowManager');
const opcionConcentracion = require('../../../Utiles/Chatgpt/opcionConcentracion');

module.exports = async function seleccionarConcentracion(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { concentraciones, PrincipioSeleccionado } = flowData;

    console.log("concentraciones", concentraciones);

    const seleccionGPT = await opcionConcentracion(data, concentraciones);

    if (!seleccionGPT || typeof seleccionGPT.concentracion !== 'number') {
        await sock.sendMessage(userId, {
            text: '❌ No se pudo interpretar la concentración. Por favor, respondé con un número válido.'
        });
        return;
    }

    const seleccion = concentraciones.find(
        c => parseFloat(c.concentracion) === parseFloat(seleccionGPT.concentracion)
    );

    if (!seleccion) {
        await sock.sendMessage(userId, {
            text: '❌ No se pudo encontrar una concentración válida. Por favor, intentá nuevamente.'
        });
        return;
    }

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado la concentración: *${(seleccion.concentracion * 100).toFixed(2)}%*. Ahora vamos al siguiente paso.`
    });

    await sock.sendMessage(userId, {
        text: `💵 ¿A qué precio querés vender el producto? Indicá un número.`
    });

    PrincipioSeleccionado.concentracion = seleccion.concentracion;

    FlowManager.setFlow(userId, "VENTA", "NegociarPrecioPago", {
        productoVenta: {
            Pactivo: PrincipioSeleccionado,
            precio: parseFloat(PrincipioSeleccionado.precio),
            concentracion: seleccion.concentracion,
        },
    });
};