"use strict";

const _ = require("lodash");
const DB = require("src/util/db.js");

const HashRateModel = require("src/models/hashrate.model.js");
const ShareModel = require("src/models/share.model.js");
const CreditEventModel = require("src/models/credit.event.model.js");

const MinerModel = DB.sequelize.define(
  "Miners",
  {
    id: {
      type: DB.Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    // Credit is a balance
    credits: {
      type: DB.Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
  },
  {
    paranoid: true,
  }
);

MinerModel.prototype.toJSON = function () {
  const self = this.dataValues;
  // TODO: find a nice number to turn into balance
  const formatted_balance = self.credits;
  return {
    ...self,
    credits: formatted_balance,
  };
};

MinerModel.hasMany(HashRateModel, { foreignKey: "minerId", targetKey: "id" });

MinerModel.hasMany(ShareModel, { foreign_key: "minerId", targetKey: "id" });

MinerModel.hasMany(CreditEventModel, { foreign_key: "minerId", targetKey: "id" });

module.exports = MinerModel;
