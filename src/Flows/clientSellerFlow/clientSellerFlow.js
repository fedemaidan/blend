const { clientSellerSteps } = require('../clientSellerFlow/clientSellerSteps');

const clientSellerFlow = {

    //Flujo de inicio, viene desde el INIT mediante una llamada directa, da inicio al flujo entrando al primer step por su nombre directo.
    async start(userId, data, sock) {

        await sock.sendMessage(userId, { text: '📝 Recopilando datos de ejemplo \n Listando datos detectados:' });
        if (userId != null && sock != null) {
            if (typeof clientSellerSteps["inicioBuy"] === 'function') {
                await clientSellerSteps["inicioBuy"](userId, data, sock);
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
            if (typeof clientSellerSteps[currentStep] === 'function') {
                await clientSellerSteps[currentStep](userId, message, sock);
            } else
            {

            }
        } else {
        }
    }

}
module.exports = clientSellerFlow