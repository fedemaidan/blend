const FlowManager = require('../../../FlowControl/FlowManager');
const calcularRenegociacion = require('../../../Utiles/Funciones/P-acticoConcentracion/calcularRenogiacion');

module.exports = async function iterarNegociacion(userId, data, sock) {
  const flowData = FlowManager.userFlows[userId]?.flowData;
  const tipoOferta = flowData?.tipoOferta;
  const flow = flowData?.flow;

  if (tipoOferta !== "EFECTIVO") {
    await sock.sendMessage(userId, {
      text: "⚠️ Por ahora solo podemos renegociar operaciones en efectivo. Finalizamos la conversación."
    });
    FlowManager.resetFlow(userId);
    return;
  }

  if (!["COMPRA", "VENTA"].includes(flow)) {
    await sock.sendMessage(userId, {
      text: "❌ Flujo no reconocido. Finalizamos aquí."
    });
    FlowManager.resetFlow(userId);
    return;
  }

  const principio = flowData?.productoDeseado?.Pactivo;
  const cantidad = flowData?.cantdeseada;
  const productoBlend = flowData?.productoBlendSeleccionado;

  if (!principio || !principio.precio || !cantidad || !productoBlend) {
    await sock.sendMessage(userId, {
      text: "❌ Faltan datos para generar la nueva propuesta."
    });
    FlowManager.resetFlow(userId);
    return;
  }

  const oferta = await calcularRenegociacion(principio, cantidad, productoBlend, flow);

  if (!oferta || oferta.length === 0) {
    await sock.sendMessage(userId, {
      text: "❌ No pudimos generar una oferta mejorada."
    });
    FlowManager.resetFlow(userId);
    return;
  }

  const detalle = oferta[0];
  const productos = detalle.cliente_recibe.productos;
  const resumen = detalle.resumen_operacion;

  let msg = `💡 *Nueva oferta reformulada:*\n\n`;

  msg += `🧾 *Productos que recibirás:*\n`;
  for (const p of productos) {
    const principioNombre = p.producto.principio || p.producto.nombre || "Producto sin nombre";
    const concentracion = (p.producto.concentracion || p.concentracion || 0) * 100;
    const cantidad = p.cantidad;
    const precio = p.precio_unitario;
    const total = p.valor_total;

    msg += `🔹 *${principioNombre}*\n`;
    msg += `   • Concentración: ${concentracion.toFixed(2)}%\n`;
    msg += `   • Cantidad: ${cantidad} unidades\n`;
    msg += `   • Precio unitario: USD ${precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    msg += `   • Valor total: USD ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;
  }

  msg += `📊 *Resumen de la operación:*\n`;
  msg += `💵 Valor original del producto principal: USD ${resumen.valor_total_deseado.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `💸 Valor que pagarás ahora: USD ${(resumen.valor_total_deseado * 0.2).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `🧪 Valor del producto Blend: USD ${resumen.valor_total_blend.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `📈 Rentabilidad recuperada con Blend: USD ${(resumen.ganancia_esperada).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;

  msg += `\n🤝 *¿Aceptás esta nueva oferta?*\n\n1️⃣ Sí\n2️⃣ No`;

  await FlowManager.setFlow(userId, flow, "AceptarOferta",{...flowData,oferta,tipoOferta: "RENEGOCIACION"});

  await sock.sendMessage(userId, { text: msg });
};
