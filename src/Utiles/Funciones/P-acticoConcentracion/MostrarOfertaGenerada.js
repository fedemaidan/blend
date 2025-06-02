const FlowManager = require('../../../FlowControl/FlowManager');
const { CalcularOfertaCompra } = require('./calcularOferta');

module.exports = async function MostrarOfertaGenerada(userId, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;

    console.log("FLOW DATA EN ELECCION BLEND.");
    console.log(JSON.stringify(flowData, null, 2));

    const {
        principiocompra,
        concentracioncompra,
        totalUnidades: cantidadDeseada,
        totaOfrecido: cantidadOfrecida,
        precio: precioNegociado,
        productoDeseado,
        productoBlendSeleccionado: productoPropio
    } = flowData;

    const oferta = await CalcularOfertaCompra(
        principiocompra,
        concentracioncompra,
        cantidadDeseada,
        cantidadOfrecida,
        precioNegociado,
        productoDeseado,
        productoPropio
    );

    if (!oferta || oferta.length === 0) {
        await sock.sendMessage(userId, {
            text: '❌ No pudimos calcular una oferta válida. Vamos a derivar tu caso a un representante.'
        });
        return;
    }

    const aporte = oferta[0].cliente_aporta;
    const recibe = oferta[0].cliente_recibe;

    const productoDeseadoRecibido = recibe.productos.find(p => !p.producto.producto_propio);
    const productoBlend = recibe.productos.find(p => p.producto.producto_propio);

    const valorAportado = aporte.cantidad * aporte.precio_unitario;
    const valorDeseado = productoDeseadoRecibido?.cantidad * productoDeseadoRecibido?.producto.precio || 0;
    const valorBlend = productoBlend?.cantidad * productoBlend?.producto.precio || 0;

    const resultadoFinal = valorAportado - (valorDeseado + valorBlend);

    // ----------------------------------------
    let msg = `✨ *Evaluación de intercambio:*\n\n`;

    msg += `🧾 *Productos que recibirás:*\n`;
    msg += `🔹 *${productoDeseadoRecibido?.producto.activos}* (Principio activo)\n`;
    msg += `   - Cantidad: ${productoDeseadoRecibido?.cantidad} unidades\n`;
    msg += `   - Precio oficial: $${productoDeseadoRecibido?.producto.precio}\n`;
    msg += `   - Valor total: $${valorDeseado.toFixed(2)}\n\n`;

    msg += `🔹 *${productoBlend?.producto.activos}* (producto propio del sistema)\n`;
    msg += `   - Cantidad: ${productoBlend?.cantidad} unidades\n`;
    msg += `   - Precio: $${productoBlend?.producto.precio}\n`;
    msg += `   - Valor compensatorio: $${valorBlend.toFixed(2)}\n\n`;

    msg += `💰 *Lo que tú aportarás como método de pago:*\n`;
    msg += `🔹 *${principiocompra.nombre}* (${(concentracioncompra.concentracion * 100).toFixed(2)}%)\n`;
    msg += `   - Cantidad: ${aporte.cantidad} unidades\n`;
    msg += `   - Precio negociado: $${aporte.precio_unitario}\n`;
    msg += `   - Valor total ofrecido: $${valorAportado.toFixed(2)}\n\n`;

    msg += `📊 *Resultado neto de la operación:*\n`;
    msg += `💵 Valor recibido total: $${(valorDeseado + valorBlend).toFixed(2)}\n`;
    msg += `💸 Valor aportado: $${valorAportado.toFixed(2)}\n`;
    msg += `📈 *Diferencia neta:* $${resultadoFinal.toFixed(2)}\n`;

    if (resultadoFinal > 0) {
        msg += `✅ *Excedente a favor del sistema*. Se garantiza rentabilidad.`;
    } else if (resultadoFinal < 0) {
        msg += `⚠️ *Excedente a favor del usuario*. El sistema entrega más valor que el recibido.`;
    } else {
        msg += `⚖️ *Intercambio equilibrado*. Rentabilidad justa alcanzada.`;
    }

    msg += `\n\n🤝 ¿Aceptás esta oferta?\n\n1️⃣ Sí\n2️⃣ No`;

    await sock.sendMessage(userId, { text: msg });

    await FlowManager.setFlow(userId, "COMPRA", "AceptarOferta", { ...flowData, oferta });
};
