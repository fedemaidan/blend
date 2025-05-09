const { PrincipioActivo } = require("../../../models");

const createPrincipioActivo = async (nombre, precio, precio_maximo) => {
  const nuevoPrincipioActivo = await PrincipioActivo.create({
    nombre,
    precio,
    precio_maximo,
  });

  return nuevoPrincipioActivo;
};

const getPrincipioActivoById = async (id) => {
  const principioActivo = await PrincipioActivo.findOne({
    where: { id },
  });

  return principioActivo;
};

const getPrincipiosActivos = async () => {
  const principiosActivos = await PrincipioActivo.findAll();

  return principiosActivos;
};

module.exports = {
  createPrincipioActivo,
  getPrincipiosActivos,
  getPrincipioActivoById,
};
