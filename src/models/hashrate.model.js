"use strict";

const DB = require("src/util/db.js");

const HashRateModel = DB.sequelize.define(
  "Hashrates",
  {
    minerId: {
      type: DB.Sequelize.UUID,
      primaryKey: true,
      references: {
        model: "Miners",
        key: "id",
      },
    },
    blockHeight: {
      type: DB.Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
    },

    time: {
      type: DB.Sequelize.DATE,
      defaultValue: DB.Sequelize.NOW,
    },

    rate: {
      type: DB.Sequelize.BIGINT,
      allowNull: false,
    }
  },
  {
    paranoid: true,
  }
);

module.exports = HashRateModel;