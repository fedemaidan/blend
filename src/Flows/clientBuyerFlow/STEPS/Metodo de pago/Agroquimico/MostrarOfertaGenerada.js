const FlowManager = require('../../../../FlowControl/FlowManager');
const { CalcularOfertaCompra } = require('../../../../../Utiles/Funciones/P-acticoConcentracion/calcularOferta');

module.exports = async function MostrarOfertaGenerada(userId, data, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const {
        ProductoParaPago,
        principiocompra,
        concentracioncompra,
        totalUnidades,
        productos,
        precio
    } = flowData;

    const oferta = await CalcularOfertaCompra(
        ProductoParaPago,
        principiocompra,
        concentracioncompra,
        totalUnidades,
        precio,
        productos
    );

    if (oferta && oferta.length > 0) {
        let msg = '✨ Hemos generado la(s) siguiente(s) oferta(s) para ti. Aquí están los detalles:\n\n';

        oferta.forEach((ofertaItem, index) => {
            msg += `*Oferta #${index + 1}:*\n\n`;

            const productoClienteAporta = ofertaItem.cliente_aporta.producto;
            const msgClienteEntrega =
                `📦 *Lo que entregarás:*\n` +
                `🔹 *${productoClienteAporta.activos}*\n` +
                `   - Marca: ${productoClienteAporta.marca}\n` +
                `   - Empresa: ${productoClienteAporta.empresa}\n` +
                `   - Cantidad: ${ofertaItem.cliente_aporta.cantidad} unidades\n` +
                `   - Precio unitario: $${ofertaItem.cliente_aporta.precio_unitario}\n`;

            let msgClienteRecibe = `🎁 *Lo que recibirás:*\n`;
            let valorTotalRecibe = 0;

            ofertaItem.cliente_recibe.productos.forEach((productoObj) => {
                if (productoObj.cantidad <= 0) return;

                const producto = productoObj.producto;
                msgClienteRecibe +=
                    `🔹 *${producto.activos}*\n` +
                    `   - Marca: ${producto.marca}\n` +
                    `   - Empresa: ${producto.empresa}\n` +
                    `   - Cantidad: ${productoObj.cantidad} unidades\n` +
                    `   - Precio unitario: $${producto.precio}\n`;

                valorTotalRecibe += productoObj.cantidad * producto.precio;
            });

            const valorTotalEntrega = ofertaItem.cliente_aporta.cantidad * ofertaItem.cliente_aporta.precio_unitario;

            msgClienteRecibe += `\n💰 *Valor total que recibirás:* $${valorTotalRecibe.toFixed(2)}`;
            const msgValoresTotales = `\n💰 *Valor total que entregarás:* $${valorTotalEntrega.toFixed(2)}`;

            msg += `${msgClienteEntrega}\n${msgClienteRecibe}\n${msgValoresTotales}\n\n`;
        });

        msg += `🤝 ¿Aceptas esta oferta?\n\n1️⃣ Sí\n2️⃣ No`;

        await sock.sendMessage(userId, { text: msg });

        await FlowManager.setFlow(userId, "PAGO", "AceptarOferta", { ...flowData, oferta });

    } else
    {
        await sock.sendMessage(userId, { text: '❌ No pudimos calcular una oferta. Derivaremos tu caso a un representante.' });

    }
}

