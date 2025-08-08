const calcularRenegociacion = async (
  pactivoDeseado,
  cantidadDeseada,
  productoBlend,
  flujo = "COMPRA"
) => {
  const oferta = [];

  const precioDeseado = parseFloat(pactivoDeseado.precio);
  const precioBlend = parseFloat(productoBlend.principio_activo.precio);
  const rentabilidadBlend = parseFloat(productoBlend.concentracion.rentabilidad);

  if (!precioDeseado || !precioBlend || !rentabilidadBlend) {
    console.error("❌ Error en los precios/rentabilidades de los productos.");
    return [];
  }

  // 💵 Valor original del producto principal (sin descuento)
  const valorOriginal = precioDeseado * cantidadDeseada;

  // 📉 Descuento aplicado al producto principal: 20%
  const descuentoProducto = 0.20;
  const precioNegociado = parseFloat((precioDeseado * (1 - descuentoProducto)).toFixed(2));
  const valorProductoPrincipal = precioNegociado * cantidadDeseada;

  // 🔁 Porción a recuperar con Blend: el total del valor original
  const porcentajeARecuperar = 0.20;
  const valorARecuperar = valorOriginal * porcentajeARecuperar;

  // 🧪 Calcular cantidad de Blend necesaria
  const gananciaPorUnidadBlend = precioBlend * rentabilidadBlend;
  const cantidadBlend = valorARecuperar / gananciaPorUnidadBlend;
  const cantidadBlendFinal = Math.ceil(cantidadBlend);
  const valorTotalBlend = cantidadBlendFinal * precioBlend;

  const resumenOperacion = {
    valor_total_deseado: valorOriginal,
    valor_total_aportado: "", // efectivo
    valor_total_blend: valorTotalBlend,
    precio_deseado_unitario: precioDeseado,
    precio_negociado_unitario: precioNegociado,
    precio_blend_unitario: precioBlend,
    rentabilidad_blend: rentabilidadBlend,
    ganancia_esperada: valorARecuperar,
    diferencia_a_recuperar: valorARecuperar,
    cantidad_blend_calculada: cantidadBlendFinal,
    resultado_final: valorProductoPrincipal + valorTotalBlend - valorOriginal
  };

  const detalleClienteRecibe = [
    {
      producto: pactivoDeseado,
      concentracion: pactivoDeseado.concentracion,
      cantidad: cantidadDeseada,
      precio_unitario: precioNegociado,
      valor_total: valorProductoPrincipal
    },
    {
      producto: {
        id_principio_activo: productoBlend.principio_activo.id,
        principio: productoBlend.principio_activo.nombre,
        id_concentracion: productoBlend.concentracion.id,
        concentracion: productoBlend.concentracion.concentracion,
        rentabilidad: rentabilidadBlend,
        precio: precioBlend
      },
      cantidad: cantidadBlendFinal,
      precio_unitario: precioBlend,
      rentabilidad: rentabilidadBlend,
      valor_total: valorTotalBlend
    }
  ];

  oferta.push({
    tipo: flujo,
    cliente_aporta: {
      nombre_principio: "Efectivo",
      concentracion: "",
      cantidad: "",
      precio_unitario: "",
      precio_ofrecido_unitario: "",
      valor_total_aportado: ""
    },
    cliente_recibe: {
      productos: detalleClienteRecibe
    },
    resumen_operacion: resumenOperacion
  });

  return oferta;
};

module.exports = calcularRenegociacion;
