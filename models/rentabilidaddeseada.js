"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RentabilidadDeseada extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RentabilidadDeseada.init(
    {
      value: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "RentabilidadDeseada",
    }
  );
  return RentabilidadDeseada;
};
