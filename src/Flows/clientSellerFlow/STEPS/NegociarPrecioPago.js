const FlowManager = require('../../../FlowControl/FlowManager');
const precioOfrecido = require('../../../Utiles/Chatgpt/precioOfrecido');

module.exports = async function NegociarPrecioPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const principio = flowData?.productoVenta.Pactivo;

    let input = data.replace(/,([^,]*)$/, '.$1');
    let precio = parseFloat(input);

console.log("////////////////////////////////////////////////////////////////////////////");
console.log("Principio Activos", principio);
console.log("precio", principio.precio);
console.log("////////////////////////////////////////////////////////////////////////////");

    if (isNaN(precio) || precio <= 0) {
        input = await precioOfrecido(null, input, "");
        precio = parseFloat(input);
        if (isNaN(precio) || precio <= 0) {
            await sock.sendMessage(userId, {
                text: '❌ Precio no válido. Por favor, ingresa un número mayor a 0.'
            });
            return;
        }
    }

    const precioFinal = parseFloat(principio.precio);
    const precioMaximoAceptado = parseFloat(principio.precio_maximo ?? precioFinal);
    const precioInicial = parseFloat((precioFinal * 0.7).toFixed(2));

    const contador = typeof flowData.contador_negociacion === "number" ? flowData.contador_negociacion : 1;

    if (precio > precioMaximoAceptado) {
        let contraoferta;

        switch (contador) {
            case 1:
                contraoferta = precioInicial;
                break;
            case 2:
                contraoferta = precioInicial + (precioFinal - precioInicial) * 0.5;
                break;
            case 3:
                contraoferta = precioInicial + (precioFinal - precioInicial) * 0.75;
                break;
            case 4:
                contraoferta = precioFinal;
                break;
            default:
                contraoferta = precioMaximoAceptado;
                break;
        }

        contraoferta = parseFloat(contraoferta.toFixed(2));

        const mensajes = {
            1: `🔹 Entiendo tu valoración, pero puedo ofrecer *${contraoferta}*.`,
            2: `🤝 Estamos más cerca. ¿Qué te parece *${contraoferta}*?`,
            3: `💰 Esta es casi mi mejor oferta: *${contraoferta}*.`,
            4: `📌 Estoy dispuesto a pagar *${contraoferta}*.`,
            default: `🛑 Mi oferta final es *${contraoferta}*.`
        };

        await sock.sendMessage(userId, { text: mensajes[contador] || mensajes.default });

        return FlowManager.setFlow(userId, "VENTA", "NegociarPrecioPago", {
            ...flowData,
            contador_negociacion: contador + 1
        });
    }

    await sock.sendMessage(userId, {
        text: `🎉 ¡Genial! Aceptamos tu precio de *${precio.toFixed(2)}*.`
    });

    await sock.sendMessage(userId, {
        text: `📦 ¿Cuántas unidades querés ofrecer de *${principio.nombre}*?`
    });

    FlowManager.setFlow(userId, "VENTA", "cantidadYpago", {
        ...flowData,
        precioVenta: precio,
    });
};