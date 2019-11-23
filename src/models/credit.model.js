'use strict';

const DB = require('src/util/db.js');

const MyriadeCreditModel = DB.sequelize.define('Credits', {

  id: {
    type: DB.Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  minerId: {
    type: DB.Sequelize.UUID,
    references: {
      model: 'Miners',
      key: 'id'
    }
  },

  time: {
    type: DB.Sequelize.DATE,
    defaultValue: DB.Sequelize.NOW
  },

  credit: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 0
  }

},{
  paranoid: true,
});


module.exports = MyriadeCreditModel;