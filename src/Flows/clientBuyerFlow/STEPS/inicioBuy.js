const FlowManager = require('../../../../FlowControl/FlowManager')
const { getPrincipiosActivosDisponibles } = require('../../../Utiles/Funciones/P-acticoConcentracion/obtenerPrincipio')

module.exports = async function inicioBuy(userId, data, sock) {

    // Paso inicial: Enviar mensaje de bienvenida y obtener principios activos
    await sock.sendMessage(userId, { text: '🛒 Perfecto, vamos a ayudarte a *comprar* productos.' });

    const principios = await getPrincipiosActivosDisponibles();

    // Mostrar los principios activos disponibles
    const msg = '📊 Primero, selecciona el principio activo que deseas adquirir. Estos son los que ofertamos actualmente:\n' +
        principios.map((p, i) => `${i + 1}. ${p.nombre}`).join('\n') +
        '\n\nPor favor, responde con el número de tu elección.';

    await sock.sendMessage(userId, { text: msg });

    FlowManager.setFlow(userId, "COMPRA", "seleccionarPrincipio", { principios });

    //FlowManager.resetFlow(userId)
};