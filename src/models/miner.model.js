'use strict';

const _ = require('lodash');
const DB = require('src/util/db.js');

const HashRateModel = require('src/models/hashrate.model.js');

const MinerModel = DB.sequelize.define('Miners', {

  id: {
    type: DB.Sequelize.UUID,
    defaultValue: DB.Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },

  monero_balance: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },

  myriade_coint_balance: {
    type: DB.Sequelize.BIGINT,
    defaultValue: 0,
    allowNull: false,
  }

});

MinerModel.hasMany(HashRateModel);

MinerModel.validFields = ['monero_balance', 'myriade_coint_balance'];

module.exports = MinerModel;
