const { Concentracion, Product } = require("../../../../models");

//BD:
//const obtenerPrincipioIntercambio  = require("../P-acticoConcentracion/BD/obtenerPrincipioIntercambio");
//const obtenerPrincipiosConStock = require("../P-acticoConcentracion/BD/obtenerPrincipiosConStock");
//const {obtenerProductosPorConcentracionYPrincipioActivo} = require("../P-acticoConcentracion/BD/obtenerProductosPorConcentracionYPrincipioActivo");

//SHEED:
const obtenerPrincipiosConStock = require("../../Google/obtenerPrincipiosConStock");
const obtenerProductosPorConcentracionYPrincipioActivo = require("../../Google/obtenerProductosPorConcentracionYPrincipioActivo");
const  obtenerPrincipioIntercambio  = require("../../Google/obtenerPrincipioIntercambio");
const obtenerPrincipiosBlend = require("../../Google/obtenerPrincipiosBlend");

async function getPrincipiosActivosDisponibles() {
    return await obtenerPrincipiosConStock()
}

async function getProductosPorConcentracionYPrincipioActivo(principioActivo, concentracion) {
    return await obtenerProductosPorConcentracionYPrincipioActivo(principioActivo, concentracion)
}

async function getPrincipiosActivosAceptados() {
    return await obtenerPrincipioIntercambio()
}

async function getPrincipiosActivosAceptadosVenta() {
    return await obtenerPrincipioIntercambio()
}

async function getPrincipiosBlend() 
{
    return await obtenerPrincipiosBlend();
}

module.exports = { getPrincipiosActivosDisponibles, getPrincipiosActivosAceptados, getProductosPorConcentracionYPrincipioActivo, getPrincipiosActivosAceptadosVenta, getPrincipiosBlend }
