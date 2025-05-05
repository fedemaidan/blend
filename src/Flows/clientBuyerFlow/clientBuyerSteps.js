const inicioBuy = require('../clientBuyerFlow/STEPS/inicioBuy');
const seleccionarPrincipio = require('../clientBuyerFlow/STEPS/seleccionarPrincipio');

const clientBuyerSteps =
{
    inicioBuy,
    seleccionarPrincipio
}
module.exports = { clientBuyerSteps };

//Repertorio de todos los steps de un flow o flujo, para que puedan ser encontrados por el flow deben encontrarse importados aqui..
//Resumen: un listado de funciones posibles del flow.