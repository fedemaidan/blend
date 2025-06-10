const InicioSell = require('./STEPS/InicioSell');
const seleccionarPrincipio = require('../clientSellerFlow/STEPS/seleccionarPrincipio');
const seleccionarConcentracion = require('../clientSellerFlow/STEPS/seleccionarConcentracion');
const cantidadYpago = require('../clientSellerFlow/STEPS/Metodo de pago/cantidadYpago');
const eleccionMetodo = require('../clientSellerFlow/STEPS/Metodo de pago/eleccionMetodo');
const AceptarOferta = require('../clientSellerFlow/STEPS/Metodo de pago/AceptarOferta');
const SeleccionarPrincipioPago = require('../clientSellerFlow/STEPS/Metodo de pago/Agroquimico/SeleccionarPrincipioPago');
const SeleccionarConcentracionPago = require('../clientSellerFlow/STEPS/Metodo de pago/Agroquimico/SeleccionarConcentracionPago');
const NegociarPrecioPago = require('../clientSellerFlow/STEPS/NegociarPrecioPago');
const CantidadOfrecida = require('../clientSellerFlow/STEPS/Metodo de pago/Agroquimico/CantidadOfrecida');

const clientSellerSteps =
{
    InicioSell,
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
module.exports = { clientSellerSteps };

//Repertorio de todos los steps de un flow o flujo, para que puedan ser encontrados por el flow deben encontrarse importados aqui..
//Resumen: un listado de funciones posibles del flow.