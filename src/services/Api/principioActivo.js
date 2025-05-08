const { PrincipioActivo } = require("../../../models");

const createPrincipioActivo = async (nombre, precio, precio_maximo, alias) => {
  const nuevoPrincipioActivo = await PrincipioActivo.create({
    nombre,
    precio,
    precio_maximo,
    alias,
  });

  return nuevoPrincipioActivo;
};

const getPrincipioActivoByNombre = async (nombre) => {
  const principioActivo = await PrincipioActivo.findOne({
    where: { nombre },
  });

  return principioActivo;
};

module.exports = {
  createPrincipioActivo,
  getPrincipioActivoByNombre,
};
