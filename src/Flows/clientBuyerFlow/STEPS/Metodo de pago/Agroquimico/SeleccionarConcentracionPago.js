const FlowManager = require('../../../../FlowControl/FlowManager');
const opcionConcentracion  = require('../../../../../Utiles/Chatgpt/opcionConcentracion');
const  getProductosPorConcentracionYPrincipioActivo  = require('../../../../../Utiles/Funciones/P-acticoConcentracion/obtenerPrincipio');

module.exports = async function SeleccionarConcentracionPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { concentracionescompra, principiocompra } = flowData;

    concentracioncompra = await opcionConcentracion(data, concentracionescompra);
  
    const ProductosParaPago = await getProductosPorConcentracionYPrincipioActivo(principiocompra, concentracioncompra);

    const msg = `✅ Has seleccionado la concentración para pago: *${(concentracioncompra * 100).toFixed(2)}%*.\n\n📦 ¿Cuál es la marca y empresa del producto que deseas ofrecer? Estas son las opciones:\n` +
        ProductosParaPago.map((p, i) => `${i + 1}. ${p.empresa} - ${p.marca}`).join('\n') +
        `\n\nPor favor, responde con el número de tu elección.`;

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "COMPRA", "SeleccionarProductoPago", {concentracioncompra,ProductosParaPago});
};