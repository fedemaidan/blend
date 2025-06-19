const FlowManager = require('../../../FlowControl/FlowManager');

module.exports = async function MostrarOfertaEfectivo(userId, sock) {
  const flowData = FlowManager.userFlows[userId]?.flowData;
  const { flow } = flowData;

  if (!["COMPRA", "VENTA"].includes(flow)) {
    await sock.sendMessage(userId, { text: "❌ No se pudo continuar: flujo no reconocido para efectivo." });
    return;
  }

  const isCompra = flow === "COMPRA";
  const { productoDeseado, cantdeseada } = flowData;

  // ✅ Obtenemos el precio unitario correctamente desde productoDeseado
  const precioUnitario = parseFloat(productoDeseado?.precio ?? productoDeseado?.Pactivo?.precio);

  if (isNaN(precioUnitario)) {
    await sock.sendMessage(userId, {
      text: "❌ Error: no se pudo obtener el precio unitario del producto."
    });
    console.error("❌ Precio inválido:", { productoDeseado });
    return;
  }

  const cantidad = parseFloat(cantdeseada);
  const total = precioUnitario * cantidad;

  const etiquetas = {
    titulo: isCompra
      ? "🧾 *Productos que recibirás:*\n"
      : "🧾 *Productos que entregaremos:*\n",
    monto: isCompra
      ? "💸 *Monto a pagar:*"
      : "💸 *Monto que te pagaremos:*",
    pregunta: isCompra
      ? "🤝 ¿Querés confirmar esta compra en efectivo?"
      : "🤝 ¿Querés aceptar esta venta en efectivo?"
  };

  let msg = `💰 *Evaluación de operación en EFECTIVO (${isCompra ? 'COMPRA' : 'VENTA'}):*\n\n`;

  msg += etiquetas.titulo;

  const principio = productoDeseado?.Pactivo?.nombre || "Sin nombre";
  const concentracion = parseFloat(productoDeseado?.Pactivo?.concentracion ?? 0) * 100;

  msg += `🔹 *${principio}*\n`;
  msg += `   • Concentración: ${concentracion.toFixed(2)}%\n`;
  msg += `   • Cantidad: ${cantidad} unidades\n`;
  msg += `   • Precio unitario: $${precioUnitario.toFixed(2)}\n`;
  msg += `   • Valor total: $${total.toFixed(2)}\n\n`;

  msg += `${etiquetas.monto} $${total.toFixed(2)}\n`;

  msg += `\n\n${etiquetas.pregunta}\n\n1️⃣ Sí\n2️⃣ No`;

  await sock.sendMessage(userId, { text: msg });

  // ✅ Armado de oferta con misma estructura que las otras
  const ofertaEfectivo = [{
    tipo: flow,

    cliente_aporta: {
      nombre_principio: isCompra ? "" : principio,
      concentracion: isCompra ? "" : productoDeseado?.Pactivo?.concentracion ?? 0,
      cantidad: isCompra ? "" : cantidad,
      precio_unitario: isCompra ? "" : precioUnitario,
      precio_ofrecido_unitario: isCompra ? "" : precioUnitario,
      valor_total_aportado: isCompra ? "" : total
    },

    cliente_recibe: {
      productos: isCompra
        ? [{
            producto: {
              nombre: principio,
              concentracion: productoDeseado?.Pactivo?.concentracion ?? 0,
              precio: precioUnitario
            },
            concentracion: productoDeseado?.Pactivo?.concentracion ?? 0,
            cantidad: cantidad,
            precio_unitario: precioUnitario,
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
      precio_negociado_unitario: precioUnitario,
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
    oferta: ofertaEfectivo
  });
};
