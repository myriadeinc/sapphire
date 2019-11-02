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
    defaultValue: {},
  },

  balance: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
  },

});

MinerModel.validFields = ['email', 'name',
  'firstName', 'lastName', 'phoneNumber',
  'gender', 'birthday', 'credential', 'wallet_address',
];

AccountModel.prototype.toJSON = function(unsafe = false) {
  if (unsafe === true) {
    return _.clone(this.get({plain: true}));
  }

  const self = this;
  const json = [
    'name', 'firstName', 'lastName',
    'wallet_address',
  ]
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

module.exports = AccountModel;
