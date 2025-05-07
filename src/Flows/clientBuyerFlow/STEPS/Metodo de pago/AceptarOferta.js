const FlowManager = require('../../../../FlowControl/FlowManager');
const  opcionElegida  = require('../../../../Utiles/Chatgpt/opcionElegida');

module.exports = async function AceptarOferta(userId, data, sock) {


    const flowData = FlowManager.userFlows[userId]?.flowData;

    respuesta = await opcionElegida(data);

    if (respuesta.data.Eleccion === 1) {
        await sock.sendMessage(userId, {
            text: '🤝 ¡Gracias por aceptar la oferta! Finalizamos la conversación aquí. ¡Hasta pronto!'
        });
        FlowManager.resetFlow(userId)
        return;
    }

    if (respuesta.data.Eleccion === 2 && respuesta.data.Eleccion === 3) {
        await sock.sendMessage(userId, {
            text: '❌ Lamentamos que no podamos llegar a un acuerdo. ¡Hasta la próxima!'
        });

        FlowManager.resetFlow(userId)
        return;
    }

    await sock.sendMessage(userId, {
        text: '❌ Respuesta no válida. Por favor, responde con *1* o *2*.'
    });
};
