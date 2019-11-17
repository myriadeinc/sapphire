'use strict';

const _ = require('lodash');
const DB = require('src/util/db.js');

const HashRateModel = require('src/models/hashrate.model.js');

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
  },

  myriade_credits: {
    type: DB.Sequelize.BIGINT,
    defaultValue: 0,
    allowNull: false,
  }

});

MinerModel.hasMany(
  HashRateModel, { foreignKey: 'minerId', targetKey: 'id' }
);

module.exports = MinerModel;
