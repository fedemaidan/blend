const FlowManager = require('../../../FlowControl/FlowManager');

module.exports = async function MostrarOfertaEfectivo(userId, sock) {
  const flowData = FlowManager.userFlows[userId]?.flowData;
  const { flow } = flowData || {};

  if (!["COMPRA", "VENTA"].includes(flow)) {
    await sock.sendMessage(userId, { text: "❌ No se pudo continuar: flujo no reconocido para efectivo." });
    return;
  }

  const isCompra = flow === "COMPRA";

  // 🔎 Producto y cantidad según flujo
  const productoBase = isCompra
    ? (flowData.productoDeseado?.Pactivo ?? flowData.productoDeseado)
    : (flowData.productoVenta?.Pactivo ?? flowData.productoVenta);

  const cantidad = parseFloat(
    isCompra
      ? flowData.cantdeseada
      : (flowData.CantVenta ?? flowData.cantdeseada) // fallback
  );

  // 🔢 Precio unitario: en VENTA priorizamos el negociado (precioVenta)
  const precioNegociadoVenta = parseFloat(flowData?.precioVenta);
  const precioUnitario = isCompra
    ? parseFloat(productoBase?.precio)
    : (isNaN(precioNegociadoVenta) ? parseFloat(productoBase?.precio) : precioNegociadoVenta);

  const concentracionRaw = productoBase?.concentracion ?? productoBase?.Pactivo?.concentracion ?? 0;
  const principio = productoBase?.nombre ?? productoBase?.principio ?? productoBase?.Pactivo?.nombre ?? "Sin nombre";

  // ✅ Validaciones
  if (isNaN(precioUnitario)) {
    await sock.sendMessage(userId, { text: "❌ Error: no se pudo obtener el precio unitario del producto." });
    console.error("❌ Precio inválido (productoBase/precioVenta):", { productoBase, precioNegociadoVenta, flowData });
    return;
  }
  if (isNaN(cantidad) || cantidad <= 0) {
    await sock.sendMessage(userId, { text: "❌ Error: cantidad inválida." });
    console.error("❌ Cantidad inválida:", { cantidad, flowData });
    return;
  }

  const total = precioUnitario * cantidad;
  const concentracionPct = (() => {
    const v = parseFloat(concentracionRaw);
    return (v <= 1 ? v * 100 : v);
  })();

  const etiquetas = {
    titulo: isCompra
      ? "🧾 *Productos que recibirás:*\n"
      : "🧾 *Productos que nos entregás:*\n",
    monto: isCompra
      ? "💸 *Monto a pagar:*"
      : "💸 *Monto que te pagaremos:*",
    pregunta: isCompra
      ? "🤝 ¿Querés confirmar esta compra en efectivo?"
      : "🤝 ¿Querés aceptar esta venta en efectivo?"
  };

  // 📨 Mensaje
  let msg = `💰✨ *Este es el resumen de la operación:*\n\n`;
  msg += etiquetas.titulo;

  msg += `🔹 *${principio}*\n`;
  msg += `   • Concentración: ${concentracionPct.toFixed(2)}%\n`;
  msg += `   • Cantidad: ${cantidad} unidades\n`;
  msg += `   • Precio unitario: USD ${precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `   • Valor total: USD ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;

  msg += `${etiquetas.monto} USD ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
  msg += `\n\n${etiquetas.pregunta}\n\n1️⃣ Sí\n2️⃣ No`;

  await sock.sendMessage(userId, { text: msg });

  // 🧾 Estructura de oferta coherente con el precio mostrado
  const ofertaEfectivo = [{
    tipo: flow,

    cliente_aporta: isCompra
      ? {
          nombre_principio: "",
          concentracion: "",
          cantidad: "",
          precio_unitario: "",
          precio_ofrecido_unitario: "",
          valor_total_aportado: ""
        }
      : {
          nombre_principio: principio,
          concentracion: productoBase?.concentracion ?? 0,
          cantidad,
          precio_unitario: precioUnitario,            // <-- negociado
          precio_ofrecido_unitario: precioUnitario,   // <-- negociado
          valor_total_aportado: total
        },

    cliente_recibe: {
      productos: isCompra
        ? [{
            producto: {
              nombre: principio,
              concentracion: productoBase?.concentracion ?? 0,
              precio: precioUnitario
            },
            concentracion: productoBase?.concentracion ?? 0,
            cantidad,
            precio_unitario: precioUnitario, // <-- negociado/base según flujo
            valor_total: total
          }]
        : []
    },

    resumen_operacion: {
      valor_total_deseado: isCompra ? total : "",
      valor_total_aportado: isCompra ? "" : total,
      valor_total_blend: "",
      precio_deseado_unitario: isCompra ? precioUnitario : "",
      precio_pago_unitario: isCompra ? "" : precioUnitario,
      precio_negociado_unitario: precioUnitario, // <-- negociado en VENTA
      precio_blend_unitario: "",
      rentabilidad_blend: "",
      ganancia_esperada: "",
      diferencia_a_recuperar: "",
      cantidad_blend_calculada: "",
      resultado_final: 0
    }
  }];

  await FlowManager.setFlow(userId, flow, "AceptarOferta", {
    ...flowData,
    oferta: ofertaEfectivo,
    tipoOferta: "EFECTIVO"
  });
};
