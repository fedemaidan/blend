const { getByChatGpt4o } = require("../Chatgpt/Base");

async function opcionPrincipio(mensajeCliente, producto) {

    const prompt = `
Como bot de un sistema de control, quiero que identifiques cuál de los siguientes producto activos desea el usuario según su mensaje (sea por el nombre o el numero de la posicion de la lista).

Devuelve EXCLUSIVAMENTE el objeto JSON completo del principio activo elegido, incluyendo sus concentraciones y productos asociados, sin agregar ningún texto adicional.

Lista de principios activos disponibles:
${JSON.stringify(producto, null, 2)}

Mensaje del usuario: "${mensajeCliente}"
`;

    const response = await getByChatGpt4o(prompt);
    const respuesta = JSON.parse(response);

    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data
    }
    else {
        return respuesta
    }
}
module.exports = opcionPrincipio;