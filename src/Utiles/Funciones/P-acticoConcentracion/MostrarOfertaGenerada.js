const FlowManager = require('../../../FlowControl/FlowManager');
const { CalcularOfertaCompra, CalcularOfertaVenta } = require('./calcularOferta');

module.exports = async function MostrarOfertaGenerada(userId, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;

    const flow = await FlowManager.getFlow(userId);
    const tipoFlujo = flow?.flowName || "VENTA"; // fallback a VENTA si no está definido

    let oferta;
    let principiocompra, concentracioncompra, cantidadDeseada, cantidadOfrecida, precioNegociado, productoDeseado, productoPropio;

    if (tipoFlujo === "COMPRA") {
        ({
            principiocompra,
            concentracioncompra,
            totalUnidades: cantidadDeseada,
            totaOfrecido: cantidadOfrecida,
            precio: precioNegociado,
            productoDeseado,
            productoBlendSeleccionado: productoPropio
        } = flowData);

        oferta = await CalcularOfertaCompra(
            principiocompra,
            concentracioncompra,
            cantidadDeseada,
            cantidadOfrecida,
            precioNegociado,
            productoDeseado,
            productoPropio
        );
    } else if (tipoFlujo === "VENTA") {
        ({
            PrincipioClieVen: principiocompra,
            concentracionSeleccionada: concentracioncompra,
            totalUnidades: cantidadDeseada,
            totalParaPagar: cantidadOfrecida,
            precio: precioNegociado,
            principioPago,
            productoBlendSeleccionado: productoPropio
        } = flowData);

        productoDeseado = principioPago;

        oferta = await CalcularOfertaVenta(
            principiocompra,
            concentracioncompra,
            cantidadDeseada,
            cantidadOfrecida,
            precioNegociado,
            productoDeseado,
            productoPropio
        );

    } else {
        console.error("❌ Tipo de flujo no reconocido:", tipoFlujo);
        await sock.sendMessage(userId, { text: "❌ No se pudo continuar: flujo no reconocido." });
        return;
    }

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
    const valorDeseado = productoDeseadoRecibido?.cantidad * productoDeseadoRecibido?.producto?.precio || 0;
    const valorBlend = productoBlend?.cantidad * productoBlend?.producto?.producto?.precio || 0;

    const resultadoFinal = valorAportado - (valorDeseado + valorBlend);

    const isCompra = tipoFlujo === "COMPRA";
    const etiquetas = {
        titulo: isCompra ? "🧾 *Productos que recibirás:*\n" : "🧾 *Productos que entregaremos:*\n",
        aporte: isCompra ? "💰 *Lo que tú aportarás como método de pago:*" : "💰 *Lo que recibirás como pago:*",
        diferencia: isCompra ? "📈 *Diferencia neta:*" : "📈 *Ganancia estimada:*",
        pregunta: isCompra ? "🤝 ¿Aceptás esta oferta?" : "🤝 ¿Querés continuar con esta propuesta?"
    };

    let msg = `✨ *Evaluación de intercambio:*\n\n`;

    msg += etiquetas.titulo;
    msg += `🔹 *${productoDeseadoRecibido?.producto?.activos}* (Principio activo)\n`;
    msg += `   - Cantidad: ${productoDeseadoRecibido?.cantidad} unidades\n`;
    msg += `   - Precio oficial: $${productoDeseadoRecibido?.producto?.precio}\n`;
    msg += `   - Valor total: $${valorDeseado.toFixed(2)}\n\n`;

    msg += `🔹 *${productoBlend?.producto?.producto?.activos}*\n`;
    msg += `   - Cantidad: ${productoBlend?.cantidad} unidades\n`;
    msg += `   - Precio: $${productoBlend?.producto?.producto?.precio}\n`;
    msg += `   - Valor total: $${valorBlend.toFixed(2)}\n\n`;

    msg += `${etiquetas.aporte}\n`;
    msg += `🔹 *${principiocompra.nombre}* (${(concentracioncompra.concentracion * 100).toFixed(2)}%)\n`;
    msg += `   - Cantidad: ${aporte.cantidad} unidades\n`;
    msg += `   - Precio negociado: $${aporte.precio_unitario}\n`;
    msg += `   - Valor total ofrecido: $${valorAportado.toFixed(2)}\n\n`;

    msg += `📊 *Resultado neto de la operación:*\n`;
    msg += `💵 Valor recibido total: $${(valorDeseado + valorBlend).toFixed(2)}\n`;
    msg += `💸 Valor aportado: $${valorAportado.toFixed(2)}\n`;
    msg += `${etiquetas.diferencia} $${Math.abs(resultadoFinal).toFixed(2)}\n`;

    msg += `\n\n${etiquetas.pregunta}\n\n1️⃣ Sí\n2️⃣ No`;

    await sock.sendMessage(userId, { text: msg });

    if(tipoFlujo === "COMPRA"){
    await FlowManager.setFlow(userId, "COMPRA", "AceptarOferta", {
        ...flowData,
        oferta
    });
    }
    else if(tipoFlujo === "VENTA"){
        await FlowManager.setFlow(userId, "VENTA", "AceptarOferta", {
            ...flowData,
            oferta
        });
    }
};
