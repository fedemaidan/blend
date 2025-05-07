'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            registro: Sequelize.STRING,
            registro_senasa: Sequelize.STRING,
            registo_inase: Sequelize.STRING,
            especie: Sequelize.STRING,
            cultivar: Sequelize.STRING,
            marca: Sequelize.STRING,
            empresa: Sequelize.STRING,
            activos: Sequelize.STRING,
            banda_toxicologica: Sequelize.STRING,
            precio: Sequelize.FLOAT,
            precio_minimo: Sequelize.FLOAT,
            precio_maximo: Sequelize.FLOAT,
            producto_propio: Sequelize.BOOLEAN,
            stock: Sequelize.INTEGER,
            potencial_proveedor: Sequelize.STRING,
            rentabilidad: Sequelize.FLOAT,
            costo_promedio_ponderado: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0.00,
            },
            activo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Products');
    },
};

