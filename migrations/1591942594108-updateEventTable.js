"use strict";

const Migration = {
    up: (queryInterface, schema, Sequelize) => {
        return updateCMSTable(queryInterface, schema, Sequelize);
    },

    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: "EventCMS", schema });
        });
    },
};

const updateCMSTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.addColumn(
        {
            tableName: 'EventCMS',
            schema: schema
        },
        "status",
        {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    )
}

module.exports = Migration;
