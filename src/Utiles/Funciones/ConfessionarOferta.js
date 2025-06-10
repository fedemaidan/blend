const guardarOferta = require('../Funciones/P-acticoConcentracion/guardarOferta');
const FlowManager = require('../../FlowControl/FlowManager');
module.exports = async function confessionarOfertaData(userId) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    
    let flow = await FlowManager.getFlow(userId);

    const aporte = flowData.oferta?.[0]?.cliente_aporta;
    const recibe = flowData.oferta?.[0]?.cliente_recibe;

    const productos_ofrecidos = [
        {
            registro: aporte?.nombre_principio || "Desconocido",
            precio_venta: aporte?.precio_unitario || 0,
            precio_referencia: flowData?.principiocompra?.precio || 0,
            cantidad: aporte?.cantidad || 0
        }
    ];

    const productos_recibidos = recibe?.productos?.map(p => ({
        registro: p.producto?.activos || "Sin nombre",
        cantidad: p.cantidad,
        precio: p.producto?.precio || 0,
        es_blend: !!p.producto?.producto_propio
    })) || [];

    const valor_total_ofertado = productos_ofrecidos.reduce((acc, p) => acc + p.precio_venta * p.cantidad, 0);
    const valor_total_recibido = productos_recibidos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const ganancia_final = valor_total_recibido - valor_total_ofertado;

    const ofertaData = {
        productos_ofrecidos,
        productos_recibidos,
        numero_telefono_cliente: flowData.numero_telefono_cliente || "Desconocido",
        rentabilidad: parseFloat(process.env.RENTABILIDAD_DESEADA || 0.3),
        valor_total_ofertado,
        valor_total_recibido,
        ganancia_final,
        negociacion: {
            tipo: flowName,
            pasos: flowData.negociacion || [],
            fecha: new Date().toISOString()
        }
    };

  await guardarOferta(ofertaData);

};