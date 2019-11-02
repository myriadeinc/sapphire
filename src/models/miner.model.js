'use strict';

const _ = require('lodash');
const DB = require('src/util/db.js');

const MinerModel = DB.sequelize.define('Miners', {
  id: {
    type: DB.Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },

  externalId: {
    type: DB.Sequelize.UUID,
    defaultValue: DB.Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
  },

  hashrate: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 0,
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

MinerModel.validFields = ['hashrate', 'monero_balance', 'myriade_coint_balance'];

MinerModel.prototype.toJSON = function(unsafe = false) {
  if (unsafe === true) {
    return _.clone(this.get({plain: true}));
  }

  const self = this;
  MinerModel.validFields
    .map((key) => {
      return [key, self.get(key)];
    })
    .filter(([field, value]) => {
      return !!value;
    })
    .reduce((acc, [key, value]) => {
      return {...acc, [key]: value};
    }, {});

  json.id = this.get('externalId');

  return json;
};

module.exports = MinerModel;
