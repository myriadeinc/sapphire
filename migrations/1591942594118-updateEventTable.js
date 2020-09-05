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
    return queryInstance.renameColumn({ tableName: 'EventCMS', schema: schema }, "tag", "tags"
    )
}

module.exports = Migration;
