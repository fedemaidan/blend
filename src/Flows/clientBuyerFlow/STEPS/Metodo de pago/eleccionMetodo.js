const FlowManager = require('../../../../FlowControl/FlowManager');
const opcionMetodoPago = require('../../../../Utiles/Chatgpt/opcionMetodoPago');
const { getPrincipiosActivosAceptados } = require('../../../../Utiles/Funciones/P-acticoConcentracion/obtenerPrincipio');

module.exports = async function eleccionMetodo(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;

    // analizar usuario
    let input = data;

    input = await opcionMetodoPago(data);

    if (input.data.Eleccion === 1) {
        await sock.sendMessage(userId, { text: '🔄 ¡Genial! Te mostraremos los principios activos disponibles para comprar.' });

        const principioscompra = await getPrincipiosActivosAceptados();

        const msg = '📋 Aquí están los principios activos en los cuales nos puedes pagar:\n' +
            principioscompra.map((p, i) => `${i + 1}. ${p.nombre}`).join('\n') +
            '\n\nPor favor, responde con el número de tu elección.';

        await sock.sendMessage(userId, { text: msg });

        await FlowManager.setFlow(userId, "COMPRA", "SeleccionarPrincipioPago", { principioscompra });
    }
    else if (input.data.Eleccion == 2)
    {
        await sock.sendMessage(userId, { text: '🔬 Te estamos transfiriendo con un especialista en el área.' });
    }
    else if (input.data.Eleccion == 3)
    {
        await sock.sendMessage(userId, { text: '❌ Cancelando operacion' });
        FlowManager.resetFlow(userId)
    }
    else
    {
        await sock.sendMessage(userId, { text: '❌ Respuesta no válida. Por favor, responde con *1* o *2*.' });
    }
};
