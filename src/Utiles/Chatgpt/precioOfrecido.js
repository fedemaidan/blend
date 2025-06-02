const { getByChatGpt4o } = require("../../services/Chatgpt/Base");

async function precioOfrecido(mensajeCliente, producto) {
    const prompt = `
Eres un bot de un sistema de control.

Analiza el siguiente mensaje del usuario y determina UNA de dos opciones:

1. Si el usuario está intentando seleccionar un principio activo (ya sea por su nombre o por el número de la lista), devuelve exclusivamente el **objeto JSON completo** del principio activo elegido (incluyendo sus concentraciones y productos asociados).

2. Si el usuario menciona un **monto de precio**, devuelve exclusivamente un JSON con el siguiente formato:

{
  "precio": "monto del usuario"
}

⚠️ IMPORTANTE: Devuelve ÚNICAMENTE uno de esos dos JSON, sin ningún texto adicional.

Lista de principios activos disponibles:
${JSON.stringify(producto, null, 2)}

Mensaje del usuario: "${mensajeCliente}"
`;

    const response = await getByChatGpt4o(prompt);

    try {
        const respuesta = JSON.parse(response);

        if (respuesta.hasOwnProperty('json_data')) {
            return respuesta.json_data;
        } else {
            return respuesta;
        }
    } catch (e) {
        console.error("❌ Error al parsear respuesta de ChatGPT:", response);
        throw e;
    }
}

module.exports = precioOfrecido;
