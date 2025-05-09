const { Oferta } = require("../../../models");

const getAllOfertas = async () => {
  return await Oferta.findAll();
};

const getOfertasByEstado = async (estado) => {
  return await Oferta.findAll({
    where: { estado },
  });
};

const getOfertaById = async (id) => {
  return await Oferta.findByPk(id);
};

const createOferta = async (ofertaData) => {
  const nuevaOferta = await Oferta.create(ofertaData);
  return nuevaOferta;
};

const updateOferta = async (id, updateData) => {
  const oferta = await Oferta.findByPk(id);

  await oferta.update(updateData);
  return oferta;
};

module.exports = {
  getAllOfertas,
  getOfertasByEstado,
  createOferta,
  updateOferta,
  getOfertaById,
};
