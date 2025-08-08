const FlowManager = require("../../FlowControl/FlowManager");
const MostrarOfertaGenerada = require('../../Utiles/Funciones/P-acticoConcentracion/MostrarOfertaGenerada');
const iterarNegociacion = require("../reNegociarPrecio/Steps/iterarNegociacion");

module.exports = async function eleccionBlend(userId, data, sock) {
    const seleccion = parseInt(data);
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { flow, IsReg } = flowData;
    const productosBlend = flowData.productosBlend;

    console.log("FLOW DATA EN ELECCION BLEND.");
    console.log(flowData);

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

    await FlowManager.setFlow(userId, flow, "AceptarOferta", {
        ...flowData,
        productoBlendSeleccionado: productoSeleccionado,
    });

    await sock.sendMessage(userId, {
        text: `✅ Seleccionaste Principio activo: *${productoSeleccionado.principio_activo.nombre}*`,
    });
    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅");
    console.log(flow);

    if (IsReg) 
        {
        await sock.sendMessage(userId, { text: "🤝*¡Aqui tenemos un nuevo trato para ti!*", });
        await FlowManager.setFlow(userId, flow, "iterarNegociacion", {...flowData, productoBlendSeleccionado: productoSeleccionado,});
        await iterarNegociacion(userId, data, sock);
        return;
    }else
        {
    await MostrarOfertaGenerada(userId, sock);
    }
}