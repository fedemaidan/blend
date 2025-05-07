'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
      Product.hasMany(models.Concentracion, {
        foreignKey: 'id_producto',
        as: 'concentraciones',
      });
    }
  }
  Product.init({
    registro: DataTypes.STRING,
    registro_senasa: DataTypes.STRING,
    registo_inase: DataTypes.STRING,
    especie: DataTypes.STRING,
    cultivar: DataTypes.STRING,
    marca: DataTypes.STRING,
    empresa: DataTypes.STRING,
    activos: DataTypes.STRING,
    banda_toxicologica: DataTypes.STRING,
    precio: DataTypes.FLOAT,
    precio_minimo: DataTypes.FLOAT,
    precio_maximo: DataTypes.FLOAT,
    producto_propio: DataTypes.BOOLEAN,
    stock: DataTypes.INTEGER,
    potencial_proveedor: DataTypes.STRING,
    rentabilidad: DataTypes.FLOAT,
    costo_promedio_ponderado: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.00
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};
