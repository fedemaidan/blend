const { getProductosPorConcentracionYPrincipioActivo } = require("../P-acticoConcentracion/obtenerPrincipio");
const math = require('mathjs');

// || a partir de aqui son los propios de la funcionalidad de compra o ClientBuyerFlow:
async function GetPedido(principioActivo, concentracion, cantidadSolicitada) {
    try {
        const productos = await getProductosPorConcentracionYPrincipioActivo(principioActivo, concentracion);

        const productosConStock = productos
            .filter(p => p.stock > 0)
            .sort((a, b) => b.stock - a.stock); // Prioriza los de mayor stock

        let totalDisponible = 0;

        for (const producto of productosConStock) {
            if (totalDisponible >= cantidadSolicitada) break;

            const cantidadNecesaria = cantidadSolicitada - totalDisponible;
            const cantidadAUsar = Math.min(cantidadNecesaria, producto.stock);

            totalDisponible += cantidadAUsar;
        }

        return totalDisponible >= cantidadSolicitada;
    } catch (error) {
        console.error('❌ Error al verificar el stock para el pedido:', error);
        return false;
    }
}

async function CalcularOfertaCompra(
    pactivoDeseado,
    cantidadeseada,
    cantidadpago,
    preciopago,
    pactivopago,
    productoPropio
) {
    const oferta = [];

    console.log("♥♥♥ Inicio CalcularOfertaCompra ♥♥♥");
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Producto deseado:", pactivoDeseado);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Cantidad deseada:", cantidadeseada);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Producto pago:", pactivopago);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Cantidad pago:", cantidadpago);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Precio pago:", preciopago);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Producto propio:", productoPropio);

    console.log("♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥");

    // ✅ Extracción segura de precio y rentabilidad del producto blend
    const precioBlend = parseFloat(productoPropio.principio_activo.precio)

    const rentabilidadBlend = parseFloat(productoPropio.concentracion.rentabilidad);

    const rentabilidadDeseada = parseFloat(process.env.RENTABILIDAD_DESEADA || 0.3);
    const precioDeseadoUnidad = parseFloat(pactivoDeseado.precio);
    const precioOfrecidoUnidad = parseFloat(pactivopago.precio);
    const precioNegociadoUnidad = parseFloat(preciopago);

    const valorDeseado = cantidadeseada * precioDeseadoUnidad;
    const valorOfrecido = cantidadpago * precioNegociadoUnidad;

    const gananciaEsperada = Math.max(valorDeseado, valorOfrecido) * rentabilidadDeseada;
    const diferenciaAPerder = Math.max(0, valorOfrecido - (precioOfrecidoUnidad * cantidadpago));
    const cuantoQuieroGanar = gananciaEsperada + diferenciaAPerder;

    const gananciaXProdBlend = precioBlend * rentabilidadBlend;
    const cantidadBlend = cuantoQuieroGanar / gananciaXProdBlend;
    const cantidadBlendFinal = Math.ceil(cantidadBlend);
    const valorTotalBlend = cantidadBlendFinal * precioBlend;

    oferta.push({
        tipo: "COMPRA",

        cliente_aporta: {
            nombre_principio: pactivopago.nombre,
            concentracion: pactivopago.concentracion,
            cantidad: cantidadpago,
            precio_unitario: precioNegociadoUnidad,
            precio_ofrecido_unitario: precioOfrecidoUnidad,
            valor_total_aportado: valorOfrecido
        },

        cliente_recibe: {
            productos: [
                {
                    producto: pactivoDeseado,
                    concentracion: pactivoDeseado.concentracion,
                    cantidad: cantidadeseada,
                    precio_unitario: precioDeseadoUnidad,
                    valor_total: valorDeseado
                },
                {
                    producto: {
                        id_principio_activo: productoPropio.principio_activo.id,
                        principio: productoPropio.principio_activo.nombre,
                        id_concentracion: productoPropio.concentracion.id,
                        concentracion: productoPropio.concentracion.concentracion,
                        rentabilidad: rentabilidadBlend,
                        precio: precioBlend
                    },
                    cantidad: cantidadBlendFinal,
                    precio_unitario: precioBlend,
                    rentabilidad: rentabilidadBlend,
                    valor_total: valorTotalBlend
                }
            ]
        },

        resumen_operacion: {
            valor_total_deseado: valorDeseado,
            valor_total_aportado: valorOfrecido,
            valor_total_blend: valorTotalBlend,
            precio_deseado_unitario: precioDeseadoUnidad,
            precio_pago_unitario: precioOfrecidoUnidad,
            precio_negociado_unitario: precioNegociadoUnidad,
            precio_blend_unitario: precioBlend,
            rentabilidad_blend: rentabilidadBlend,
            ganancia_esperada: gananciaEsperada,
            diferencia_a_recuperar: diferenciaAPerder,
            cantidad_blend_calculada: cantidadBlendFinal,
            resultado_final: valorOfrecido - (valorDeseado + valorTotalBlend)
        }
    });

    return oferta;
}

async function CalcularOfertaVenta(
    principiocompra,
    cantidadDeseada,
    cantidadOfrecida,
    precioNegociado,
    productoDeseado,
    productoPropio
) {
    const oferta = [];

    console.log("♥♥♥ Inicio CalcularOfertaCompra ♥♥♥");
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Producto deseado:", principiocompra);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Producto pago:", cantidadDeseada);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Cantidad pago:", cantidadOfrecida);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Precio pago:", precioNegociado);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Producto propio:", productoDeseado);
    console.log("🔍---------------------------------------------------------------🔍");
    console.log("   - Producto propio:", productoPropio);
    console.log("♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥");

    if (!productoDeseado?.precio || isNaN(productoDeseado.precio)) {
        console.error("❌ Error: Producto deseado inválido.");
        return [];
    }

    const precioBlend = parseFloat(productoPropio?.principio_activo?.precio);
    const rentabilidadBlend = parseFloat(productoPropio?.concentracion?.rentabilidad);

    if (!precioBlend || !rentabilidadBlend) {
        console.error("❌ Error: Producto Blend inválido o sin datos de rentabilidad/precio.");
        return [];
    }

    const rentabilidadDeseada = parseFloat(process.env.RENTABILIDAD_DESEADA || 0.3);
    const precioDeseadoUnidad = parseFloat(productoDeseado.precio);
    const precioOfrecidoUnidad = parseFloat(principiocompra.precio);
    const precioNegociadoUnidad = parseFloat(precioNegociado);

    const valorDeseado = cantidadDeseada * precioDeseadoUnidad;
    const valorOfrecido = cantidadOfrecida * precioNegociadoUnidad;

    const gananciaEsperada = Math.max(valorDeseado, valorOfrecido) * rentabilidadDeseada;
    const diferenciaAPerder = Math.max(0, valorOfrecido - (precioOfrecidoUnidad * cantidadOfrecida));
    const cuantoQuieroGanar = gananciaEsperada + diferenciaAPerder;

    const gananciaXProdBlend = precioBlend * rentabilidadBlend;
    const cantidadBlend = cuantoQuieroGanar / gananciaXProdBlend;
    const cantidadBlendFinal = Math.ceil(cantidadBlend);
    const valorTotalBlend = cantidadBlendFinal * precioBlend;

    oferta.push({
        tipo: "VENTA",

        cliente_aporta: {
            nombre_principio: principiocompra.nombre,
            concentracion: principiocompra.concentracion,
            cantidad: cantidadOfrecida,
            precio_unitario: precioNegociadoUnidad,
            precio_referencia: precioOfrecidoUnidad,
            valor_total_aportado: valorOfrecido
        },

        cliente_recibe: {
            productos: [
                {
                    producto: productoDeseado,
                    concentracion: productoDeseado.concentracion,
                    cantidad: cantidadDeseada,
                    precio_unitario: precioDeseadoUnidad,
                    valor_total: valorDeseado
                },
                {
                    producto: {
                        id_principio_activo: productoPropio.principio_activo.id,
                        principio: productoPropio.principio_activo.nombre,
                        id_concentracion: productoPropio.concentracion.id,
                        concentracion: productoPropio.concentracion.concentracion,
                        rentabilidad: rentabilidadBlend,
                        precio: precioBlend
                    },
                    cantidad: cantidadBlendFinal,
                    precio_unitario: precioBlend,
                    rentabilidad: rentabilidadBlend,
                    valor_total: valorTotalBlend
                }
            ]
        },

        resumen_operacion: {
            valor_total_deseado: valorDeseado,
            valor_total_aportado: valorOfrecido,
            valor_total_blend: valorTotalBlend,
            precio_deseado_unitario: precioDeseadoUnidad,
            precio_pago_unitario: precioOfrecidoUnidad,
            precio_negociado_unitario: precioNegociadoUnidad,
            precio_blend_unitario: precioBlend,
            rentabilidad_blend: rentabilidadBlend,
            ganancia_esperada: gananciaEsperada,
            diferencia_a_recuperar: diferenciaAPerder,
            cantidad_blend_calculada: cantidadBlendFinal,
            resultado_final: valorOfrecido - (valorDeseado + valorTotalBlend)
        }
    });

    return oferta;
}

module.exports = { GetPedido, CalcularOfertaCompra, CalcularOfertaVenta }