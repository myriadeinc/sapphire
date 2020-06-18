"use strict";

const Migration = {
  up: (queryInterface, schema, Sequelize) => {
    return createCreditEventTable(queryInterface, schema, Sequelize);
  },

  down: (queryInterface, schema, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable({ tableName: "CreditEvents", schema });
    });
  },
};
const createCreditEventTable = (queryInterface, schema, Sequelize) => {
  return queryInterface.createTable(
    "CreditEvents",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      minerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Miners",
          key: "id",
        },
      },

      amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      lockType: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
      },

      eventTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      contentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "EventCMS",
          key: "id"
        }
      },

      comments: {
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
