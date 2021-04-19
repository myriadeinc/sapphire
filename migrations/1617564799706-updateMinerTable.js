'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return updateMinerTable(queryInterface, schema, Sequelize);
    },

    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: "Miners", schema });
        });
    }
};

const updateMinerTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.addColumn(
        {
            tableName: 'Miners',
            schema: schema
        },
        "monero_balance",
        {
            type: Sequelize.BIGINT,
            defaultValue: 0
        }
    ) 
        && queryInstance.addColumn(
        {
            tableName: 'Miners',
            schema: schema
        },
        "pps_ratio",
        {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    )
}

module.exports = Migration;
