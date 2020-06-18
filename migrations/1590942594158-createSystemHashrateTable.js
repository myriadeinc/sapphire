'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createSystemHashrateTable(queryInterface, schema, Sequelize);
    },

    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: "SystemHashrates", schema });
        });
    }
};
const createSystemHashrateTable = (queryInterface, schema, Sequelize) => {
    return queryInterface.createTable(
        "SystemHashrates",
        {
            blockHeight: {
                type: Sequelize.BIGINT,
                primaryKey: true,
            },
            // Defined as accumulation of all miner shares * difficulty
            poolRate: {
                type: Sequelize.BIGINT,
            },
            time: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            globalDiff: {
                type: Sequelize.BIGINT,
            },
            reward: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
            deletedAt: { type: Sequelize.DATE },
        }, {
        schema: schema
    });
}
module.exports = Migration;
