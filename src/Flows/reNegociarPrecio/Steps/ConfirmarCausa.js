const FlowManager = require('../../../FlowControl/FlowManager');
const opcionElegida = require('../../../Utiles/Chatgpt/opcionElegida');
const mostrarBlend = require('../../../Utiles/Funciones/mostrarBlend');

module.exports = async function ConfirmarCausa(userId, data, sock) {
    const respuesta = await opcionElegida(data);
    console.log("Respuesta de la opcion elegida en CONFIRMAR CAUSA::", respuesta);
    if (respuesta.data.Eleccion === 1) 
    {
        console.log("❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌RECALCULANDO OFERTA❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌");
        await mostrarBlend(userId, sock);
        return;
    }

    if (respuesta.data.Eleccion === 2 || respuesta.data.Eleccion === 3)
     {
        await sock.sendMessage(userId, {text: 'Eseperamos tu mensaje para entablar una nueva transaccion, Hasta pronto!'});
        await FlowManager.resetFlow(userId);
        return;
    }
    await sock.sendMessage(userId, {text: '❌ Respuesta no válida. Por favor, responde con *1* o *2*.'});
};