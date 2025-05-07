const FlowManager = require('../../../../FlowControl/FlowManager');
const  precioOfrecido  = require('../../../Utiles/Chatgpt/precioOfrecido');

module.exports = async function NegociarPrecioPago(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const { ProductoParaPago } = flowData;

    // analizar usuario
    let input = data;
    input = input.replace(/,([^,]*)$/, '.$1');
    let precio = parseFloat(input);

    if (isNaN(precio) || precio <= 0) {
        input = await precioOfrecido(null, input, "");
        precio = parseFloat(input);
        if (isNaN(precio) || precio <= 0) {
            await sock.sendMessage(userId, { text: '❌ Precio no válido. Por favor, ingresa un número mayor a 0.' });
            return;
        }
    }

    const contador_negociacion = typeof flowData.contador_negociacion === "number" ? flowData.contador_negociacion : 1;

    if (ProductoParaPago.precio < precio) {
        const precioInicial = ProductoParaPago.precio_minimo;
        const precioMedio = ((ProductoParaPago.precio + ProductoParaPago.precio_minimo) / 2).toFixed(2);
        const precioFinal = ProductoParaPago.precio.toFixed(2);

        let msg;

        switch (contador_negociacion) {
            case 1:
                msg = `🔹 Entiendo que valoras tu producto, pero puedo valuarlo en *${precioInicial}*.`;
                break;
            case 2:
                msg = `🤝 Estamos acercándonos. Puedo aceptar un valor de *${precioMedio}*.`;
                break;
            case 3:
                msg = `💰 Esta es mi última oferta: *${precioFinal}*.`;
                break;
            default:
                msg = `📌 Mi oferta final sigue siendo *${precioFinal}*.`;
        }

        await sock.sendMessage(userId, { text: msg });

        await FlowManager.setFlow(userId, "PAGO", "NegociarPrecioPago", {
            ...flowData,
            contador_negociacion: contador_negociacion + 1
        });

        return;
    }

    // Si el precio es aceptable, se pasa al siguiente paso
    await FlowManager.setFlow(userId, "PAGO", "MostrarOfertaGenerada", {
        ...flowData,
        precio,
        contador_negociacion: contador_negociacion // lo dejamos igual por si lo necesita MostrarOfertaGenerada
    });
};
