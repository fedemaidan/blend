const FlowManager = require('../../../../../FlowControl/FlowManager');
const precioOfrecido = require('../../../../../Utiles/Chatgpt/precioOfrecido');


module.exports = async function NegociarPrecioPago(userId, data, sock) {
    console.log("🟡 Iniciando NegociarPrecioPago");

    const flowData = FlowManager.userFlows[userId]?.flowData;
    const concentracion = flowData?.concentracioncompra;
    const principio = flowData?.principiocompra;

    if (!concentracion || !principio) {
        await sock.sendMessage(userId, {
            text: '❌ No se pudo recuperar la información necesaria para la negociación. Intenta de nuevo desde el inicio.'
        });
        console.error("❌ Faltan datos: concentracion o principio");
        return;
    }

    let input = data;
    input = input.replace(/,([^,]*)$/, '.$1');
    let precio = parseFloat(input);

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
    const precioInicial = parseFloat((precioFinal * 0.7).toFixed(2)); // Punto de partida para negociar si no hay máximo

    const contador = typeof flowData.contador_negociacion === "number"
        ? flowData.contador_negociacion
        : 1;

    console.log("🟡 Usuario ofrece:", precio);
    console.log("🟡 Rango de negociación: ", precioInicial, "→", precioFinal, " (Max aceptado:", precioMaximoAceptado, ")");

    // Si el precio ofrecido es mayor al máximo aceptado, negociamos
    if (precio > precioMaximoAceptado) {
        let contraoferta;
        if (contador === 1) {
            contraoferta = precioInicial;
        } else if (contador === 2) {
            contraoferta = precioInicial + (precioFinal - precioInicial) * 0.5;
        } else if (contador === 3) {
            contraoferta = precioInicial + (precioFinal - precioInicial) * 0.75;
        } else if (contador === 4) {
            contraoferta = precioFinal;
        } else {
            contraoferta = precioMaximoAceptado;
        }

        contraoferta = parseFloat(contraoferta.toFixed(2));

        const mensajes = {
            1: `🔹 Entiendo tu valoración, pero puedo ofrecer *${contraoferta}*.`,
            2: `🤝 Estamos más cerca. ¿Qué te parece *${contraoferta}*?`,
            3: `💰 Esta es casi mi mejor oferta: *${contraoferta}*.`,
            4: `📌 Estoy dispuesto a pagar *${contraoferta}*.`,
            default: `🛑 Mi oferta final es *${contraoferta}*.`
        };

        const msg = mensajes[contador] || mensajes.default;

        await sock.sendMessage(userId, { text: msg });

        await FlowManager.setFlow(userId, "COMPRA", "NegociarPrecioPago", {
            ...flowData,
            contador_negociacion: contador + 1
        });

        return;
    }

    // Si el precio ofrecido es aceptable (menor o igual al máximo)
    await sock.sendMessage(userId, {
        text: `🎉 ¡Genial! Aceptamos tu precio de *${precio.toFixed(2)}.`
    });

   await sock.sendMessage(userId, {
    text: `📦 ¿Cuántas unidades querés ofrecer de *${principio.nombre}*?`
});

    await FlowManager.setFlow(userId, "COMPRA", "CantidadOfrecida", {...flowData, precio});

};
