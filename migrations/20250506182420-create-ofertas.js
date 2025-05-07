'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ofertas', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            productos_ofrecidos: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: [],
            },
            productos_recibidos: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
            },
            estado: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'pendiente',
            },
            numero_telefono_cliente: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            rentabilidad: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00,
            },
            valor_total_recibido: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            valor_total_ofertado: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            ganancia_final: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ofertas');
    },
};
