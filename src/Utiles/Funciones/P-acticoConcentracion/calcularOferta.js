const { Concentracion, Product } = require("../../../../models");
const { getProductosPorConcentracionYPrincipioActivo } = require("../P-acticoConcentracion/obtenerPrincipio");
const math = require('mathjs');

async function calcularOferta(
    principio_activo_elegido,
    concentracion_principio_activo_elegido,
    cantidad_principio_activo_ofrecido,
    precio_acordado_principio_activo_ofrecido,
    producto_ofrecido_por_cliente) {
    const concentracionesElegidas = principio_activo_elegido.concentraciones.filter((concentracion) => concentracion.concentracion == concentracion_principio_activo_elegido);

    const productosElegidos = concentracionesElegidas.sort((a, b) => b.producto.stock - a.producto.stock);
    const productoElegido = productosElegidos[0].producto;
    const precioTotal = precio_acordado_principio_activo_ofrecido * cantidad_principio_activo_ofrecido;

    const productoPropio = await Product.findOne({ where: { producto_propio: true }, order: [['stock', 'DESC']] });

    let { cantidadElegida, cantidadProductoPropio } = calcularCantidades(precioTotal, productoElegido, productoPropio, producto_ofrecido_por_cliente, precio_acordado_principio_activo_ofrecido);

    if (isNaN(cantidadElegida) || isNaN(cantidadProductoPropio) || cantidadElegida <= 0 || cantidadProductoPropio <= 0) {
        cantidadProductoPropio = 0;
        cantidadElegida = precioTotal / productoElegido.precio;
        cantidadElegida = Math.round(cantidadElegida)
    }


    const info_bot = {
        cliente_aporta: {
            producto: producto_ofrecido_por_cliente,
            cantidad: cantidad_principio_activo_ofrecido,
            precio_unitario: precio_acordado_principio_activo_ofrecido,
        },
        cliente_recibe: {
            productos: [
                {
                    producto: productoPropio,
                    cantidad: cantidadProductoPropio
                },
                {
                    producto: productoElegido,
                    cantidad: cantidadElegida
                }
            ]
        },
    };
    console.log(info_bot)
    return info_bot
}

//calcularCantidades(precioTotal, productosElegidos, producto_ofrecido_por_cliente, precio_acordado_principio_activo_ofrecido)
function calcularCantidades(precioTotal, productoElegido, productoPropio, productoOfrecidoCliente, precioOperacionOfrecida) {
    console.log(precioTotal, productoElegido, productoPropio, productoOfrecidoCliente, precioOperacionOfrecida)
    // Parámetros y precios de los productos
    const precioElegido = productoElegido.precio;
    const precioOfrecidoCliente = productoOfrecidoCliente.precio;
    const gananciaPorCadaUnidadDelRecibido = precioOfrecidoCliente - precioOperacionOfrecida;
    const precioPropio = productoPropio.precio;
    const rentabilidadPropio = (productoPropio.rentabilidad / 100);
    const rentabilidadDeseada = 0.1;

    // Matriz de coeficientes y términos independientes
    const A = [
        [precioPropio, precioElegido],
        [precioPropio * rentabilidadPropio, gananciaPorCadaUnidadDelRecibido]
    ];

    const B = [precioTotal, rentabilidadDeseada * precioTotal];

    console.log("A", A)
    console.log("B", B)

    //visualizar determinante de A <-Problema MATRIX sin inversa->
    console.log('Matriz A:', A);
    console.log('Determinante de A:', math.det(A));

    // Resolver el sistema de ecuaciones // Si A es = 0 Usar aproximacion, caso contrario Lusolve!
    let solution;  // Definimos la variable antes del if para ser utilizada mas adelante!

    if (math.det(A) === 0) {
        console.warn('La matriz A es singular, usando pseudoinversa...');
        solution = math.multiply(math.pinv(A), B);

        // presentar la solucion como lo haria Lusolve, para evitar que lea 0
        solution = solution.map(x => [x]);

        console.log('Solución con pseudoinversa:', solution);
    } else {
        solution = math.lusolve(A, B);
        console.log('Solución exacta:', solution);
    }

    // Extraer los valores de C1 y C2
    const cantidadProductoPropio = solution[0][0];
    const cantidadElegida = solution[1][0];

    // Convertimos los valores a enteros
    return {
        cantidadElegida: Math.round(cantidadElegida),
        cantidadProductoPropio: Math.round(cantidadProductoPropio)
    };
}

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
    principiocompra,
    concentracioncompra,
    cantidadDeseada,
    cantidadOfrecida,
    precioNegociado,
    productoDeseado,
    productoPropio
) {
    console.log("🔍 PARAMETROS RECIBIDOS:");
    console.log("🧪 Principio compra:", principiocompra);
    console.log("💧 Concentración compra:", concentracioncompra);
    console.log("📦 Cantidad deseada:", cantidadDeseada);
    console.log("📦 Cantidad ofrecida:", cantidadOfrecida);
    console.log("💵 Precio negociado:", precioNegociado);
    console.log("🎯 Producto deseado:", productoDeseado);
    console.log("🧫 Producto propio:", productoPropio);

    const oferta = [];

    if (!productoDeseado?.precio || isNaN(productoDeseado.precio)) {
        console.error("❌ Error: Producto deseado inválido.");
        return [];
    }

    if (!productoPropio?.precio || !productoPropio?.rentabilidad) {
        console.error("❌ Error: Producto Blend inválido o sin datos de rentabilidad/precio.");
        return [];
    }

    const rentabilidadDeseada = 0.3;
    const precioDeseadoUnidad = parseFloat(productoDeseado.precio);
    const precioOfrecidoUnidad = parseFloat(principiocompra.precio);
    const precioNegociadoUnidad = parseFloat(precioNegociado);

    const valorDeseado = cantidadDeseada * precioDeseadoUnidad;
    const valorOfrecido = cantidadOfrecida * precioNegociadoUnidad;

    const gananciaEsperada = valorDeseado * rentabilidadDeseada;
    const diferenciaAPerder = Math.max(0, valorOfrecido - (precioOfrecidoUnidad * cantidadOfrecida));
    const cuantoQuieroGanar = gananciaEsperada + diferenciaAPerder;

    const faltante = Math.max(0, valorDeseado + cuantoQuieroGanar - valorOfrecido);
    const cantidadBlend = faltante / (productoPropio.precio / productoPropio.rentabilidad);

    console.log("📊 Cálculos intermedios:");
    console.log("   - Valor deseado:", valorDeseado);
    console.log("   - Valor ofrecido:", valorOfrecido);
    console.log("   - Ganancia esperada:", gananciaEsperada);
    console.log("   - Diferencia a recuperar:", diferenciaAPerder);
    console.log("   - Faltante con Blend:", faltante);
    console.log("   - Cantidad Blend necesaria:", Math.ceil(cantidadBlend));

    oferta.push({
        cliente_aporta: {
            nombre_principio: principiocompra.nombre,
            concentracion: concentracioncompra.concentracion,
            cantidad: cantidadOfrecida,
            precio_unitario: precioNegociadoUnidad
        },
        cliente_recibe: {
            productos: [
                {
                    producto: productoDeseado,
                    cantidad: cantidadDeseada
                },
                {
                    producto: productoPropio,
                    cantidad: Math.ceil(cantidadBlend)
                }
            ]
        }
    });

    console.log("♥♥♥ Fin CalcularOfertaCompra ♥♥♥\n");

    return oferta;
}


async function calcularCantidadesCompra(
    cantidadDeseada,          // Cantidad fija del producto que el cliente quiere recibir
    productoRecibido,         // Producto que se desea recibir (ej: GLIFOSATO)
    productoPropio,           // Producto propio para complementar la oferta (si aplica)
    productoPago,             // Producto con el que el cliente paga (ej: ATRAZINA)
    precioNegociado,          // Precio unitario negociado para el producto de pago
    margenDeseado = 0.1       // Margen deseado, por defecto 10%
) {
    // Precios
    const precioRecibido = productoRecibido.precio;     // Precio del producto recibido
    const precioPago = productoPago.precio;             // Precio del producto de pago
    const precioPropio = productoPropio.precio;         // Precio del producto propio

    // Valor fijo de lo que el cliente debe recibir (sin aporte extra)
    const V_recibidoFijo = cantidadDeseada * precioRecibido;

    // Calcular cantidad mínima de producto de pago para cubrir al menos el valor fijo
    const Q_pago_min = V_recibidoFijo / ((1 - margenDeseado) * precioPago);
    const Q_pago = Math.ceil(Q_pago_min); // Redondeamos hacia arriba para garantizar el margen

    // Valor pagado total en producto de pago
    const V_pagado = Q_pago * precioPago;
    // Valor que se debe entregar, de acuerdo al margen deseado
    const V_entregado = (1 - margenDeseado) * V_pagado;

    // Calcular cuánto producto propio es necesario para completar el valor entregado
    let cantidadPropio = 0;
    if (V_entregado > V_recibidoFijo) {
        cantidadPropio = (V_entregado - V_recibidoFijo) / precioPropio;
    }
    cantidadPropio = Math.round(cantidadPropio);

    return {
        cantidadPago: Q_pago,          // Cantidad de producto de pago que aporta el cliente
        cantidadRecibida: cantidadDeseada, // Cantidad fija del producto que se recibe
        cantidadPropio: cantidadPropio // Cantidad de producto propio a agregar para cumplir el margen
    };
}

module.exports = {calcularOferta, GetPedido, CalcularOfertaCompra }