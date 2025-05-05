const FlowManager = require('../../../../FlowControl/FlowManager')
const opcionPrincipio = require('../../../Utiles/Chatgpt/opcionPrincipio')
const getConcentraciones = require('../../../Utiles/Funciones/P-acticoConcentracion/obtenerConcentracion')

module.exports = async function seleccionarPrincipio(userId, data, sock) {

    const {principios} = FlowManager.userFlows[userId]?.flowData

    const seleccion = await opcionPrincipio(data, principios)

    const concentraciones = await getConcentraciones(seleccion)

    const msg = '📊 Elige la concentración disponible para este principio activo. Estas son las opciones:\n' +
        concentraciones.map((c, i) => `${i + 1}. ${(c * 100).toFixed(2)}%`).join('\n') +
        '\n\nPor favor, responde con el número de tu elección.'

    await sock.sendMessage(userId, { text: msg });

    FlowManager.setFlow(userId, "COMPRA", "ConfirmarOModificarRuta", {principioSeleccionado:seleccion, concentraciones } );

    //FlowManager.resetFlow(userId)
};