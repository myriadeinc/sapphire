'use strict';

const _ = require('lodash');
const DB = require('src/util/db.js');

const HashRateModel = require('src/models/hashrate.model.js');
const MyriadeCreditModel = require('src/models/credit.model.js');

const MinerModel = DB.sequelize.define('Miners', {

  id: {
    type: DB.Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },

  monero_balance: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 0,
  }

});

MinerModel.hasMany(
  HashRateModel, { foreignKey: 'minerId', targetKey: 'id' }
);

MinerModel.hasMany(
  MyriadeCreditModel, { foreignKey: 'minerId', targetKey: 'id' }
)

module.exports = MinerModel;
