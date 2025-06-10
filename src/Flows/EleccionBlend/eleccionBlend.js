const FlowManager = require("../../FlowControl/FlowManager");
const MostrarOfertaGenerada = require('../../Utiles/Funciones/P-acticoConcentracion/MostrarOfertaGenerada');

module.exports = async function eleccionBlend(userId, data, sock) {

    const seleccion = parseInt(data);

    const flowData = FlowManager.userFlows[userId]?.flowData;

    const productosBlend = flowData.productosBlend;

    console.log("FLOW DATA EN ELECCION BLEND.")
    console.log(flowData)

    if (!productosBlend || productosBlend.length === 0) {
        await sock.sendMessage(userId, {
            text: "⚠️ Ocurrió un error. No se encontraron productos disponibles para Blend. Volvé a empezar.",
        });
        return;
    }

    if (isNaN(seleccion) || seleccion < 1 || seleccion > productosBlend.length) {
        await sock.sendMessage(userId, {
            text: "❌ Opción inválida. Por favor, respondé con el número correspondiente a uno de los productos listados.",
        });
        return;
    }

    const productoSeleccionado = productosBlend[seleccion - 1];

    const flujoActual = flowData.flowName
    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅")
    console.log(flujoActual)
    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅")

    await FlowManager.setFlow(userId, flujoActual, "AceptarOferta", {
        ...flowData,
        productoBlendSeleccionado: productoSeleccionado,
    });

    await sock.sendMessage(userId, {
        text: `✅ Seleccionaste Principio activo: *${productoSeleccionado.principio}*`,
    });

    await MostrarOfertaGenerada(userId, sock);
};
