const { RentabilidadDeseada } = require("../../../models");

const setRentabilidadDeseada = async (value) => {
  try {
    // Intentar encontrar el registro (siempre será ID=1)
    const [rentabilidad, created] = await RentabilidadDeseada.findOrCreate({
      where: { id: 1 },
      defaults: {
        value: parseFloat(value),
      },
    });

    if (!created) {
      await rentabilidad.update({ value: parseFloat(value) });
    }

    return {
      rentabilidad,
    };
  } catch (error) {
    console.error("Error al establecer rentabilidad deseada:", error);
    throw error;
  }
};

const getRentabilidadDeseada = async () => {
  try {
    const [rentabilidad] = await RentabilidadDeseada.findOrCreate({
      where: { id: 1 },
      defaults: {
        value: 0,
      },
    });

    return rentabilidad;
  } catch (error) {
    console.error("Error al obtener rentabilidad deseada:", error);
    throw error;
  }
};

module.exports = {
  setRentabilidadDeseada,
  getRentabilidadDeseada,
};
