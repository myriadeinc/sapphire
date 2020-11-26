"use strict";

const DB = require("src/util/db.js");

const CreditEventModel = DB.sequelize.define(
  "CreditEvents",
  {
    id: {
      type: DB.Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    minerId: {
      type: DB.Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Miners",
        key: "id",
      },
    },
    amount: {
      type: DB.Sequelize.BIGINT,
      allowNull: false,
    },
    lockType: {
      type: DB.Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: DB.Sequelize.SMALLINT,
      allowNull: false,
    },
    eventTime: {
      type: DB.Sequelize.DATE,
      allowNull: false,
    },
    contentId: {
      type: DB.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "EventCMS",
        key: "id"
      }
    },
    comments: {
      type: DB.Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = CreditEventModel;
