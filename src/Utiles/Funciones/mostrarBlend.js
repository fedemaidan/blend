const ObtenerPrincipiosBlend = require("./P-acticoConcentracion/BD/ObtenerPrincipiosBlend");
const FlowManager = require("../../FlowControl/FlowManager");

module.exports = async function mostrarBlend(userId, sock) {

    const flowData = FlowManager.userFlows[userId]?.flowData;
    const productosBlend = await ObtenerPrincipiosBlend();

    if (!productosBlend || productosBlend.length === 0) {
        await sock.sendMessage(userId, {
            text: "⚠️ No hay productos propios disponibles actualmente para Blend."
        });
        return;
    }

    let mensaje = "*Bienvenido al módulo Blend de productos propios*\n\n";
    mensaje += "🔬 *Productos disponibles para Blend:*\n\n";

    productosBlend.forEach((item, i) => {
        mensaje += `🧪 *${i + 1}.* ${item.producto}\n`;
        mensaje += `   • Principio activo: ${item.principio}\n`;
        mensaje += `   • Concentración: ${(item.concentracion * 100).toFixed(2)}%\n`;
    });

    mensaje += "📌 *Indicá el número del producto que querés usar para tu Blend.*";

    await sock.sendMessage(userId, { text: mensaje });

    await FlowManager.setFlow(userId, "BLEND", "eleccionBlend", {...flowData, productosBlend});
};
