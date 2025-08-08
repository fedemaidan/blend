const FlowManager = require('../../../../FlowControl/FlowManager');
const opcionElegida = require('../../../../Utiles/Chatgpt/opcionElegida');
const ConfessionarOferta = require('../../../../Utiles/Funciones/ConfessionarOferta');

module.exports = async function AceptarOferta(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const tipoOferta = flowData?.tipoOferta;

    const respuesta = await opcionElegida(data);

    if (respuesta.data.Eleccion === 1) {
        await sock.sendMessage(userId, {
            text: '🤝 ¡Gracias por aceptar la oferta! Nosotros finalizamos la conversación aquí, pero alguien de Blend se contactará para acordar los detalles. ¡Hasta pronto!'
        });
        await ConfessionarOferta(userId);
        FlowManager.resetFlow(userId);
        return;
    }

    if (respuesta.data.Eleccion === 2 || respuesta.data.Eleccion === 3) {
        let msg = '';

        if (tipoOferta === "AGRO") {
            msg = "Ups, a veces pasa. Podés comenzar nuevamente el chat o te llamamos para charlarlo.\n\n1️⃣ Probemos juntos una vez más\n2️⃣ Espero su llamado";
        } else if (tipoOferta === "EFECTIVO") {
            msg = "🤝 ¿Por qué no querés realizar esta operación?\n\n1️⃣ Por el precio\n2️⃣ Porque simplemente me arrepentí y quiero comenzar nuevamente con el chat";
            await sock.sendMessage(userId, { text: msg });
            await FlowManager.setFlow(userId, "RENEGOCIACION", "ConfirmarCausa", flowData);
            return;
        } else {
            msg = "❌ Tipo de oferta no reconocido. Finalizamos la conversación por ahora.";
        }

        await sock.sendMessage(userId, { text: msg });
        FlowManager.resetFlow(userId);
        return;
    }

    await sock.sendMessage(userId, {
        text: '❌ Respuesta no válida. Por favor, respondé con *1* o *2*.'
    });
};