const FlowManager = require('../../FlowControl/FlowManager');

module.exports = async function MenuFist(userId, data, sock) {
    const msg = `👋 ¡Bienvenido/a a *Blend*!

¿Qué operación deseas realizar?

1️⃣ -Compra  
2️⃣ -Venta  
3️⃣ -Ayuda

✏️ *Responde con el número de la opción deseada.*`;

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "MENU", "ConfirmarFlujo", data);
};