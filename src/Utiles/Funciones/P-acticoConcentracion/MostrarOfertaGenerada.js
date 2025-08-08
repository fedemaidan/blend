const FlowManager = require('../../../FlowControl/FlowManager');
const { CalcularOfertaCompra, CalcularOfertaVenta } = require('./calcularOferta');

module.exports = async function MostrarOfertaGenerada(userId, sock) {
  const flowData = FlowManager.userFlows[userId]?.flowData;
  const { flow } = flowData;

  let oferta;

  if (flow === "COMPRA") {
    let { productoDeseado, cantdeseada, cantpago, preciopago, productoPago, productoBlendSeleccionado } = flowData;

    oferta = await CalcularOfertaCompra(
      productoDeseado.Pactivo,
      cantdeseada,
      cantpago,
      preciopago,
      productoPago.Pactivo,
      productoBlendSeleccionado
    );

  } else if (flow === "VENTA") {
    let { productoVenta, precioVenta, CantVenta, productoPago, Cantapagar, productoBlendSeleccionado } = flowData;

    oferta = await CalcularOfertaVenta(
      productoVenta.Pactivo,
      Cantapagar,
      CantVenta,
      precioVenta,
      productoPago.Pactivo,
      productoBlendSeleccionado
    );
  } else {
    await sock.sendMessage(userId, { text: "❌ No se pudo continuar: flujo no reconocido." });
    return;
  }

  if (!oferta || oferta.length === 0) {
    await sock.sendMessage(userId, {
      text: '❌ No pudimos calcular una oferta válida. Vamos a derivar tu caso a un representante.'
    });
    return;
  }

  const isCompra = flow === "COMPRA";
  const aporte   = oferta[0].cliente_aporta;
  const recibe   = oferta[0].cliente_recibe;
  const resumen  = oferta[0].resumen_operacion;

  const etiquetas = {
    titulo: isCompra
      ? "🧾 *Productos que recibirás:*\n"
      : "🧾 *Productos que entregaremos:*\n",
    aporte: isCompra
      ? "💰 *Lo que te compramos en parte de pago:*"
      : "💰 *Nos has vendido en parte de pago:*",
    diferencia: isCompra
      ? "📉 *Más adelante arreglamos la diferencia de:*"
      : "📈 *Más adelante arreglamos la diferencia de:*",
    pregunta: isCompra
      ? "🤝 ¿Querés confirmar esta compra?"
      : "🤝 ¿Querés aceptar esta propuesta de venta?"
  };

  let msg = `✨ *Evaluación de intercambio (${isCompra ? 'COMPRA' : 'VENTA'}):*\n\n`;

  msg += etiquetas.titulo;

  for (const p of recibe.productos) {
    const principio = p.producto.principio || p.producto.nombre || "Sin nombre";
    const concentracion = (p.producto.concentracion || 0) * 100;
    const cantidad = p.cantidad;
    const precio = p.precio_unitario;
    const total = p.valor_total;

    msg += `🔹 *${principio}*\n`;
    msg += `   • Concentración: ${concentracion.toFixed(2)}%\n`;
    msg += `   • Cantidad: ${cantidad} unidades\n`;
    msg += `   • Precio unitario: USD ${precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    msg += `   • Valor total: USD ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;
  }

  msg += `${etiquetas.aporte}\n`;
  msg += `🔹 *${aporte.nombre_principio}*\n`;
  msg += `   • Concentración: ${(aporte.concentracion * 100).toFixed(2)}%\n`;
  msg += `   • Cantidad: ${aporte.cantidad} unidades\n`;
  msg += `   • Precio negociado: USD ${aporte.precio_unitario.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `   • Valor total aportado: USD ${resumen.valor_total_aportado.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;

  msg += `📊 *En resumen:*\n`;
  msg += `💵 Te envíaremos mercadería por un total de:  USD ${(resumen.valor_total_deseado + resumen.valor_total_blend).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `💸 Vos nos despachas por un total de: USD ${resumen.valor_total_aportado.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `${etiquetas.diferencia} USD ${Math.abs(resumen.resultado_final).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;

  msg += `\n\n${etiquetas.pregunta}\n\n1️⃣ Sí\n2️⃣ No`;

  await sock.sendMessage(userId, { text: msg });

  await FlowManager.setFlow(userId, flow, "AceptarOferta", {
    ...flowData,
    oferta,
    tipoOferta: "AGRO"
  });
};
