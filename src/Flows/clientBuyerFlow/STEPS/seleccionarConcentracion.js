const FlowManager = require('../../../FlowControl/FlowManager');
const opcionConcentracion = require('../../../Utiles/Chatgpt/opcionConcentracion');

module.exports = async function seleccionarConcentracion(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { concentraciones, principioSeleccionado } = flowData;

    // GPT devuelve un objeto con sólo la propiedad .concentracion
    const seleccionGPT = await opcionConcentracion(data, concentraciones);

    if (!seleccionGPT || typeof seleccionGPT.concentracion !== 'number') {
        await sock.sendMessage(userId, {
            text: '❌ No se pudo interpretar la concentración. Por favor, respondé con un número válido.'
        });
        return;
    }

    // Buscar dentro de concentraciones originales la que coincida en valor
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

    const msg = `⚠️ Los pedidos son armados en base a su concentración y principio activo, por lo cual un pedido puede tener más de una marca.\n\n📦 ¿Cuántas unidades (litros, kilos, gramos, packs) quieres adquirir? Por favor, responde con la cantidad.`;
    await sock.sendMessage(userId, { text: msg });

 FlowManager.setFlow(userId, "COMPRA", "cantidadYpago", {
    principioSeleccionado,
    concentracionSeleccionada: seleccion,
    productoDeseado: {
        activos: principioSeleccionado.nombre,
        precio: parseFloat(principioSeleccionado.precio),
        marca: "Marca N/A",     // si no lo tenés, podés poner algo por defecto
        empresa: "Empresa N/A"
    }
});
};
