const { getByChatGpt4o } = require("../Chatgpt/Base");

async function opcionConcentracion(mensajeCliente, concentraciones) {
    const prompt = `
Como bot de un sistema de control, quiero que identifiques cuál de las siguientes concentraciones desea el usuario según su mensaje (ya sea por el valor o el número en la lista).

Devuelve EXCLUSIVAMENTE el objeto JSON completo de la concentración elegida, incluyendo el producto asociado, sin agregar ningún texto adicional.

Lista de concentraciones disponibles:
${JSON.stringify(concentraciones, null, 2)}

Mensaje del usuario: "${mensajeCliente}"
`;

    const response = await getByChatGpt4o(prompt);
    const respuesta = JSON.parse(response);

    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data;
    } else {
        return respuesta;
    }
}

module.exports = opcionConcentracion;