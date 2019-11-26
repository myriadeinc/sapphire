'use strict';

const DB = require('src/util/db.js');

const ShareModel = DB.sequelize.define('Shares', {

  id: {
    type: DB.Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },

  minerId: {
    type: DB.Sequelize.UUID,
    allowNull: false,
  },

  share: {
    type: DB.Sequelize.INTEGER,
    allowNull: false,
  },

  difficulty: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
  },

  is_calculated: {
    type: DB.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

  time: {
    type: DB.Sequelize.DATE,
    allowNull: false,
  },
}, {
  paranoid: true,
});


module.exports = ShareModel;
