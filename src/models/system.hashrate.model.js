"use strict";

const DB = require("src/util/db.js");

const SystemHashrateModel = DB.sequelize.define(
  "SystemHashrates",
  {
    blockHeight: {
      type: DB.Sequelize.BIGINT,
      primaryKey: true,
    },
    // Defined as accumulation of all miner shares * difficulty
    poolRate: {
      type: DB.Sequelize.BIGINT,
      allowNull: false,
    },
    time: {
      type: DB.Sequelize.DATE,
      defaultValue: DB.Sequelize.NOW,
    },
    globalDiff: {
      type: DB.Sequelize.BIGINT,
      allowNull: false,
    },
    reward: {
      type: DB.Sequelize.BIGINT,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = SystemHashrateModel;
