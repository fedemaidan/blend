const getConcentracionesAceptados = require('../P-acticoConcentracion/BD/concentracion');

module.export = async function getConcentraciones(principio)
{
    return await getConcentracionesAceptados(principio);
}