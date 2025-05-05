const FlowManager = require('../../../../FlowControl/FlowManager');
const { GetPedido } = require('../../../../Utiles/Funciones/P-acticoConcentracion/calcularOferta');

module.exports = async function ConfirmarOModificarRuta(userId, data, sock) {

    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { principioSeleccionado, concentracionSeleccionada } = flowData;

    const productos = await GetPedido(principioSeleccionado, concentracionSeleccionada, cantidad);

    const totalUnidades = productos.reduce((acc, p) => acc + p.stockUsado, 0);

    const listado = productos.map((p, i) =>
        `${i + 1}. ${p.marca} de ${p.empresa} - ${p.stockUsado}`
    ).join('\n');

    const msgProductos = `📋 Aquí están los productos:\n${listado}\n\n🛒 Total de unidades: ${totalUnidades}`;
    await sock.sendMessage(userId, { text: msgProductos });

    const msg2 = `🛒 ¿Quieres pagar con otro agroquímico?\n\n1. Sí\n2. No`;
    await sock.sendMessage(userId, { text: msg2 });

    await FlowManager.setFlow(userId, "COMPRA", "FinalizarCompra", {
        productos,
        totalUnidades
    });
};
