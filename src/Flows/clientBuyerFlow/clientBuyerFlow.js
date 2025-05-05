const { clientBuyerSteps } = require('../clientBuyerFlow/clientBuyerSteps');

const clientBuyerFlow = {

    //Flujo de inicio, viene desde el INIT mediante una llamada directa, da inicio al flujo entrando al primer step por su nombre directo.
    async start(userId, data, sock) {

        await sock.sendMessage(userId, { text: '📝 Recopilando datos de ejemplo \n Listando datos detectados:' });
        if (userId != null && sock != null) {
            if (typeof clientBuyerSteps["inicioBuy"] === 'function') {
                await clientBuyerSteps["inicioBuy"](userId, data, sock);
            } else
            {

            }
        } else {
        }
    },

    //Cuando ya nos encontremos dentro del flujo navegandolo, siempre que mandemos un mensaje y llegue aqui verificara el nombre del step actual.
    async Handle(userId, message, currentStep, sock, messageType) {

        if (userId != null && sock != null) {

            // Y que EgresoMaterialSteps es un objeto que contiene tus funciones
            if (typeof clientBuyerSteps[currentStep] === 'function') {
                await clientBuyerSteps[currentStep](userId, message, sock);
            } else
            {

            }
        } else {
        }
    }

}
module.exports = clientBuyerFlow