const FlowManager = require('../../../../FlowControl/FlowManager');
const opcionPrincipio  = require('../../../../../Utiles/Chatgpt/opcionProducto');

module.exports = async function SeleccionarProductoPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { ProductosParaPago } = flowData;

    ProductoParaPago = await opcionPrincipio(data, ProductosParaPago );

    await sock.sendMessage(userId, {
        text: `✅ Has seleccionado el producto: *${ProductoParaPago.marca} - ${ProductoParaPago.empresa}*. Ahora vamos al siguiente paso.\n\n💲 ¿Qué valor tiene tu producto por cada unidad? Por favor, indícalo en dólares.`
    });

    await FlowManager.setFlow(userId, "COMPRA", "NegociarPrecioPago", {ProductoParaPago});
};
