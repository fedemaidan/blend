const FlowManager = require('../../../../FlowControl/FlowManager');
const { GetPedido } = require('../../../../Utiles/Funciones/P-acticoConcentracion/calcularOferta');

module.exports = async function cantidadYpago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { productoDeseado } = flowData ?? {};

    console.log("🔍 productoDeseado completo:");
    console.dir(productoDeseado, { depth: null, colors: true });

    // ✅ Validación de cantidad
    const cantidad = parseFloat(data);
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(userId, { text: "❌ Por favor, ingresa una *cantidad válida de unidades*." });
        return;
    }

    // ✅ Validación de concentración
    const valorConcentracion = parseFloat(productoDeseado.concentracion);
    if (isNaN(valorConcentracion)) {
        await sock.sendMessage(userId, {
            text: "❌ Ocurrió un error al interpretar la concentración seleccionada. Volvé a elegir el producto."
        });
        return;
    }

    // ✅ Verificar disponibilidad usando GetPedido
    const hayStock = await GetPedido(productoDeseado.Pactivo, valorConcentracion, cantidad);

    if (!hayStock) {
        await sock.sendMessage(userId, {
            text: "❌ No hay suficiente stock disponible para esa cantidad. Probá con un valor distinto."
        });
        return;
    }

    await sock.sendMessage(userId, {
        text: `✅ Perfecto, tenemos disponibilidad para ${cantidad} unidad(es) del principio activo seleccionado.\n\n🛒 ¿Quieres pagar con otro agroquímico?\n\n1. Sí\n2. No`
    });

    await FlowManager.setFlow(userId, "COMPRA", "eleccionMetodo", {
        cantdeseada: cantidad
    });
};
