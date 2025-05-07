'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Concentracion extends Model {
    static associate(models) {
      // Relación con PrincipioActivo
      Concentracion.belongsTo(models.PrincipioActivo, { foreignKey: 'id_principio_activo', as: 'principioActivo'  });

      // Relación con Product
      Concentracion.belongsTo(models.Product, { foreignKey: 'id_producto', as: 'producto' });
    }
  }

  Concentracion.init(
    {
      id_principio_activo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'PrincipioActivos',
          key: 'id',
        },
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
      },
      concentracion: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Concentracion',
      tableName: 'concentraciones',
      timestamps: true,
    }
  );

  return Concentracion;
};
