const FlowManager = require('../../../../FlowControl/FlowManager');
const opcionMetodoPago = require('../../../../Utiles/Chatgpt/opcionMetodoPago');
const { getPrincipiosActivosDisponibles } = require('../../../../Utiles/Funciones/P-acticoConcentracion/obtenerPrincipio');

module.exports = async function eleccionMetodo(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;

    let input = await opcionMetodoPago(data);

    if (input.data.Eleccion === 1) {
        await sock.sendMessage(userId, { text: '🔄 ¡Genial! Te mostraremos los principios activos con los que te podemos pagar.' });

        const productosParaPago = await getPrincipiosActivosDisponibles();

        const msg = '📋 Aquí están los principios activos disponibles como pago:\n' +
            productosParaPago.map((p, i) => `${i + 1}. ${p.principio_activo.nombre}`).join('\n') +
            '\n\nPor favor, responde con el número de tu elección.';

        await sock.sendMessage(userId, { text: msg });

        await FlowManager.setFlow(userId, "VENTA", "SeleccionarPrincipioPago", {
            productosParaPago
        });
    }
    else if (input.data.Eleccion == 2) {
        await sock.sendMessage(userId, { text: '🔬 Te estamos transfiriendo con un especialista en el área.' });
    }
    else if (input.data.Eleccion == 3) {
        await sock.sendMessage(userId, { text: '❌ Cancelando operación.' });
        FlowManager.resetFlow(userId);
    }
    else {
        await sock.sendMessage(userId, { text: '❌ Respuesta no válida. Por favor, respondé con *1*, *2* o *3*.' });
    }
};
