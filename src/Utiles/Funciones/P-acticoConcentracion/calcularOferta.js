const { Concentracion, Product } = require("../../models");
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
async function GetPedido(principioActivo, concentracion, input) {
    try {
        // Obtener los productos disponibles
        const productos = await getProductosPorConcentracionYPrincipioActivo(principioActivo, concentracion);

        // obtener productos con stock positivo y filtrarlos por cantidad (En lo posible evitar ensaladas de productos)
        const productosConStock = productos.filter(p => p.stock > 0).sort((a, b) => b.stock - a.stock);

        //Establecer variables del pedido! puede ser mas de un producto.
        let totalPedido = 0;
        const pedidoFinal = [];

        // Recorrer los productos hasta cumplir el pedido
        for (const producto of productosConStock) {
            if (totalPedido < input) {
                const cantidadNecesaria = input - totalPedido;
                const cantidadAUsar = Math.min(cantidadNecesaria, producto.stock); // Tomar lo necesario sin pasarse

                totalPedido += cantidadAUsar;

                // Agregar producto con la cantidad a usar
                pedidoFinal.push({
                    id: producto.id,
                    activos: producto.activos,
                    empresa: producto.empresa,
                    marca: producto.marca,
                    PrincipioActivo: principioActivo,
                    Concentracion: concentracion,
                    stockUsado: cantidadAUsar,
                    precio: producto.precio
                });
            } else {
                break; // Si ya cumplimos el pedido, salimos del loop
            }
        }

        // Si no se logró suplir el pedido completo, lanzar error
        if (totalPedido < input) {
            return [];
        }
        return pedidoFinal;
    } catch (error) {
        console.error('Error al generar el pedido:', error);
        throw new Error('No se pudo completar el pedido.');
    }
}


async function CalcularOfertaCompra(
    ProductoParaPago,                 // Producto de pago (ej: ATRAZINA)
    productoDeseado,                  // Producto que el cliente quiere (ej: GLIFOSATO)
    concentracion_deseada,            // (Podría ser usado para filtrar o mostrar info)
    cantidadDeseada,                  // Cantidad que el cliente quiere recibir (por ejemplo, 20)
    precioNegociado,                  // Precio negociado del producto de pago
    productos_deseados                // Usualmente un array, pero aquí puedes pasar [productoDeseado]
) {
    const oferta = [];

    // Suponemos que 'productos_deseados' contiene el producto que se quiere recibir
    for (const producto of productos_deseados) {
        // Obtenemos el producto propio (para complementar la oferta)
        const productoPropio = await Product.findOne({
            where: { producto_propio: true },
            order: [['stock', 'DESC']]
        });

        // Calcular cantidades
        const {
            cantidadPago,
            cantidadRecibida,
            cantidadPropio
        } = await calcularCantidadesCompra(
            cantidadDeseada,     // Cantidad fija deseada
            producto,            // Producto recibido (ej: GLIFOSATO)
            productoPropio,      // Producto propio
            ProductoParaPago,    // Producto de pago (ej: ATRAZINA)
            precioNegociado      // Precio negociado del producto de pago
        );

        // Construir la oferta
        oferta.push({
            cliente_aporta: {
                producto: ProductoParaPago,        // Producto de pago (ej: ATRAZINA)
                cantidad: cantidadPago,            // Calculado
                precio_unitario: precioNegociado,
            },
            cliente_recibe: {
                productos: [
                    {
                        producto: productoPropio,
                        cantidad: cantidadPropio
                    },
                    {
                        producto: producto,            // Producto deseado (ej: GLIFOSATO)
                        cantidad: cantidadRecibida      // Fijado en cantidadDeseada
                    }
                ]
            },
        });
    }

    console.log(oferta);
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