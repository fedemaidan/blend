const inicioBuy = require('../clientBuyerFlow/STEPS/inicioBuy');
const seleccionarPrincipio = require('../clientBuyerFlow/STEPS/seleccionarPrincipio');
const seleccionarConcentracion = require('../clientBuyerFlow/STEPS/seleccionarConcentracion');
const cantidadYpago = require('../clientBuyerFlow/STEPS/Metodo de pago/cantidadYpago');
const eleccionMetodo = require('../clientBuyerFlow/STEPS/Metodo de pago/eleccionMetodo');
const AceptarOferta = require('../clientBuyerFlow/STEPS/Metodo de pago/AceptarOferta');
const SeleccionarPrincipioPago = require('../clientBuyerFlow/STEPS/Metodo de pago/Agroquimico/SeleccionarPrincipioPago');
const SeleccionarConcentracionPago = require('../clientBuyerFlow/STEPS/Metodo de pago/Agroquimico/SeleccionarConcentracionPago');
const NegociarPrecioPago = require('../clientBuyerFlow/STEPS/Metodo de pago/Agroquimico/NegociarPrecioPago');
const CantidadOfrecida = require('../clientBuyerFlow/STEPS/Metodo de pago/Agroquimico/CantidadOfrecida');

const clientBuyerSteps =
{
    inicioBuy,
    seleccionarPrincipio,
    seleccionarConcentracion,
    cantidadYpago,
    eleccionMetodo,
    AceptarOferta,
    SeleccionarPrincipioPago,
    SeleccionarConcentracionPago,
    NegociarPrecioPago,
    CantidadOfrecida
}
module.exports = { clientBuyerSteps };

//Repertorio de todos los steps de un flow o flujo, para que puedan ser encontrados por el flow deben encontrarse importados aqui..
//Resumen: un listado de funciones posibles del flow.