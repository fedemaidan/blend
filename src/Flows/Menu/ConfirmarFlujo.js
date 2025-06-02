
const inicioBuy = require('../clientBuyerFlow/STEPS/inicioBuy');
//userId, data, sock
module.exports = async function ConfirmarFlujo(userId, data, sock) {
  
    const opcion = data.trim();

    switch (opcion) {
        case "1":
            await sock.sendMessage(userId, { text: "🛒 Iniciando el proceso de *compra*..." });
            await inicioBuy(userId, data, sock);
            break;

        case "2":
            await sock.sendMessage(userId, { text: "💸 Iniciando el proceso de *venta*..." });
            //await FlowManager.setFlow(userId, "VENTA", "seleccionarProducto");
            break;

        case "3":
            await sock.sendMessage(userId, {
                text: `❓ *Ayuda Blend*\n\nEscribí:\n1️⃣ para comprar\n2️⃣ para vender\nO pedí asistencia con "hablar con un humano".`
            });
           // await FlowManager.setFlow(userId, "MENU", "ConfirmarFlujo"); // vuelve al menú
            break;

        default:
            await sock.sendMessage(userId, {
                text: "⚠️ Opción no válida. Por favor, respondé con *1*, *2* o *3*. o la accion deseada"
            });
            break;
    }
};