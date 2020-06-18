"use strict";

const Migration = {
  up: (queryInterface, schema, Sequelize) => {
    return createEventCmsTable(queryInterface, schema, Sequelize);
  },

  down: (queryInterface, schema, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable({ tableName: "EventCMS", schema });
    });
  },
};
const createEventCmsTable = (queryInterface, schema, Sequelize) => {
  return queryInterface.createTable(
    "EventCMS",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      data: {
        type: Sequelize.JSONB,
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE },
    },
    { schema: schema }
  );
};
module.exports = Migration;
