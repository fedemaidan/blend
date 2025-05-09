"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const PrincipioActivo = sequelize.define("PrincipioActivo", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    precio_maximo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    alias: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Usar ARRAY para PostgreSQL
      allowNull: true,
      defaultValue: [], // Inicializa como un array vacío
    },
    activo: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: true, // Por defecto, el principio activo estará activo
    },
  });

  // Definir la asociación con Concentracion
  PrincipioActivo.associate = (models) => {
    PrincipioActivo.hasMany(models.Concentracion, {
      foreignKey: "id_principio_activo",
      as: "concentraciones",
    });
  };

  return PrincipioActivo;
};
