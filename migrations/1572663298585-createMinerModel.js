'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createMinerTable(queryInterface, schema, Sequelize);

    },
    
    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: 'Miners', schema });
        });
    }
};

const createMinerTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.createTable(
        'Miners',
        {
            id: {
                type: Sequelize.UUID,
                unique: true,
                primaryKey: true,
                allowNull: false
            },
            monero_balance: {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 0,
            },    
            myriade_credits: {
                type: Sequelize.BIGINT,
                defaultValue: 0,
                allowNull: false,
            },
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
            deletedAt: { type: Sequelize.DATE }
        },{
            schema: schema
        }
    );
};

module.exports = Migration;
