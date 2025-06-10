
const inicioBuy = require('../clientBuyerFlow/STEPS/inicioBuy');
const InicioSell = require('../clientSellerFlow/STEPS/InicioSell');
//userId, data, sock
module.exports = async function ConfirmarFlujo(userId, data, sock) {

    const opcion = data.trim();

    switch (opcion) {
        case "1":
            await sock.sendMessage(userId, { text: "🛒 Perfecto, vamos a ayudarte a *comprar* productos." });
            await inicioBuy(userId, data, sock);
            break;

        case "2":
            await sock.sendMessage(userId, { text: "🛒 Perfecto, vamos a ayudarte a *vender* productos." });
            await InicioSell(userId, data, sock);
            break;

        case "3":
            const msg = '🤖 Blendy es un asistente virtual que te ayuda a comprar, vender e intercambiar agroquímicos. 🚜\n\n' +
                'En Blend te conectamos con un amplio stock de agroquímicos y semillas de todas las marcas, *sin la necesidad de que seas cliente directo de todos los laboratorios o semilleros*. Creamos una red que optimiza tu inversión, reduce riesgos y facilita el acceso a los insumos que necesitas.\n\n' +
                'Podés vendernos o comprarnos productos; el flujo de mercadería es bidireccional. Operamos con una cuenta corriente como siempre: podés pagarnos con transferencias o cheques, o dejar un saldo en dólares que reduciremos comprándote productos. También es posible que tengas un saldo a favor con nosotros; en ese caso, podríamos cancelarlo con un pago, pero preferimos hacerlo proveyéndote algo que necesites ahora o en el futuro.\n\n' +
                'Cuando necesites un agroquímico, te ofreceremos la mejor opción posible, con un combo diseñado para cubrir las hectáreas que tu cliente va a aplicar. Con el tiempo, ampliaremos nuestra oferta de productos propios, incluyendo coadyuvantes, biológicos y agroquímicos con marca Blend Agro.\n\n' +
                '¿Te gustaría que trabajemos juntos?\n' +
                '1️⃣ Querés *comprar* productos.\n' +
                '2️⃣ Querés *vender* productos.\n' +
                '3️⃣ Quiero terminar la conversación.\n' +
                '\nPor favor, responde con el número de la opción que deseas. 🧠';
            await sock.sendMessage(userId, {text: msg});
            break;

        default:
            await sock.sendMessage(userId, {text: "⚠️ Opción no válida. Por favor, respondé con *1*, *2* o *3*. o la accion deseada"});
            break;
    }
};