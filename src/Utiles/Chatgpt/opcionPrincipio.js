const { getByChatGpt4o } = require("../../services/Chatgpt/Base");

// 👉 Elimina todos los campos "id" del array de principios (y sus concentraciones)
function limpiarPrincipios(principios) {
    return principios.map(p => ({
        nombre: p.nombre,
        alias: p.alias,
        precio: p.precio,
        precio_maximo: p.precio_maximo,
        activo: p.activo,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        concentraciones: (p.concentraciones || []).map(c => ({
            concentracion: c.concentracion
        }))
    }));
}

async function opcionPrincipio(mensajeCliente, principios) {
    const principiosSinIds = limpiarPrincipios(principios);

    const prompt = `
Eres un bot de control de stock. El usuario debe elegir un principio activo de una lista.

📌 INSTRUCCIONES:
- El usuario puede escribir el *nombre* del principio activo o simplemente indicar su *posición en la lista* (por ejemplo, "1" significa el primer elemento de la lista).
- 🚫 **Nunca interpretes un número como un ID.**
- ✅ **Siempre interpreta un número como la posición (1-based) en la lista que se muestra.**

📋 Lista de principios activos disponibles:
${JSON.stringify(principiosSinIds, null, 2)}

📨 Mensaje del usuario: "${mensajeCliente}"

📤 Devuelve EXCLUSIVAMENTE el objeto JSON completo del principio activo seleccionado, incluyendo sus concentraciones disponibles. No agregues texto adicional.
`;

    const response = await getByChatGpt4o(prompt);
    const respuesta = JSON.parse(response);

    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data;
    } else {
        return respuesta;
    }
}

module.exports = opcionPrincipio;