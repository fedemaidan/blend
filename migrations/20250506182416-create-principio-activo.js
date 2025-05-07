'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('PrincipioActivos', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            nombre: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            precio: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            precio_maximo: Sequelize.DECIMAL(10, 2),
            alias: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
                defaultValue: [],
            },
            activo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('PrincipioActivos');
    },
};
