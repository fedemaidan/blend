const {getPrincipiosBlend} = require("../Funciones/P-acticoConcentracion/obtenerPrincipio");
const FlowManager = require("../../FlowControl/FlowManager");

module.exports = async function mostrarBlend(userId, sock) {
  const flowData = FlowManager.userFlows[userId]?.flowData;
  const productosBlend = await getPrincipiosBlend();

  if (!productosBlend || productosBlend.length === 0) {
    await sock.sendMessage(userId, {
      text: "⚠️ No hay productos propios disponibles actualmente para Blend."
    });
    return;
  }

  let mensaje = "*Toda aplicacion de fitosanitarios precisa un coadyuvante que la complemente*\n";
  mensaje += "🤝 *En esta tampoco te dejamos solo:*\n\n";
  mensaje += "💧 ¿Qué producto de Blend Agro elegirías para continuar?\n";

  let index = 1;
  const listaProductos = [];

  productosBlend.forEach(p => {
    p.concentraciones.forEach(c => {
      mensaje += `🧪 *${index}.* ${p.principio_activo.nombre}\n`;
      mensaje += `   • Concentración: ${(c.concentracion * 100).toFixed(2)}%\n`;
      listaProductos.push({
        principio_activo: p.principio_activo,
        concentracion: c
      });
      index++;
    });
  });

  mensaje += "\n📌*Indicá el número del producto que querés usar para tu  propio Blend.*";

  await sock.sendMessage(userId, { text: mensaje });

  await FlowManager.setFlow(userId, "BLEND", "eleccionBlend", {
    ...flowData,
    productosBlend: listaProductos
  });
};