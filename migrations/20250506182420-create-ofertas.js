'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ofertas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      productos_ofrecidos: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: JSON.stringify([
          {
            registro: "",
            precio_venta: 0.00,
            precio_referencia: 0.00,
            cantidad: 0
          }
        ])
      },
      productos_recibidos: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pendiente'
      },
      numero_telefono_cliente: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rentabilidad: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      valor_total_recibido: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      valor_total_ofertado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      ganancia_final: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      negociacion: {
        type: Sequelize.JSON,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ofertas');
  }
};