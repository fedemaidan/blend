'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Oferta = sequelize.define('Oferta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    productos_ofrecidos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [
        {
          registro: "",
          precio_venta: 0.00,
          precio_referencia: 0.00,
          cantidad: 0
        }
      ]
    },
    productos_recibidos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente'
    },
    numero_telefono_cliente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rentabilidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    valor_total_recibido: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    valor_total_ofertado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    ganancia_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'Oferta',
    tableName: 'ofertas',
    timestamps: true,
  });

  return Oferta;
};
