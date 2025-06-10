const FlowManager = require('../../FlowControl/FlowManager');

module.exports = async function MenuFist(userId, data, sock) {
const msg = `👋 ¡Hola! Bienvenido a Blendy. Soy tu asistente personal para la compra, venta e intercambio de agroquímicos. 🚜`;

const msg_base = 'Puedo ayudarte si:\n' +
'1️⃣ Querés *comprar* productos.\n' +
'2️⃣ Querés *vender* productos.\n' +
'3️⃣ Quiero saber más del servicio.\n' +
'\nPor favor, responde con el número de la opción que deseas. 🧠';

    await sock.sendMessage(userId, { text: msg });
    await sock.sendMessage(userId, { text: msg_base });

    await FlowManager.setFlow(userId, "MENU", "ConfirmarFlujo", data);
};