const { getByChatGpt4o } = require("../../services/Chatgpt/Base");

// 👉 Eliminar los campos "id" de cada concentración
function limpiarConcentraciones(concentraciones) {
    return concentraciones.map(c => ({
        concentracion: c.concentracion,
        // Si hay otros campos útiles los podés mantener, pero evitá "id"
        producto: c.producto ? {
            marca: c.producto.marca,
            empresa: c.producto.empresa,
            activos: c.producto.activos,
            registro: c.producto.registro,
            stock: c.producto.stock,
            precio: c.producto.precio
        } : undefined
    }));
}

async function opcionConcentracion(mensajeCliente, concentraciones) {
    const concentracionesLimpias = limpiarConcentraciones(concentraciones);

    const prompt = `
Eres un bot de control de stock. El usuario debe elegir una concentración de principio activo de una lista.

📌 INSTRUCCIONES:
- El usuario puede responder con el *valor de la concentración* (ej: "0.24" o "24%") o con un *número indicando la posición en la lista* (por ejemplo, "1" es la primera concentración).
- 🚫 **Nunca interpretes un número como un ID.**
- ✅ **Siempre interpreta un número como la posición (1-based) en la lista mostrada.**

📋 Lista de concentraciones disponibles:
${JSON.stringify(concentracionesLimpias, null, 2)}

📨 Mensaje del usuario: "${mensajeCliente}"

📤 Devuelve EXCLUSIVAMENTE el objeto JSON completo de la concentración seleccionada. No agregues ningún texto adicional.
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
