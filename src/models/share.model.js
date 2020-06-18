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
    references: {
      model: 'Miners',
      key: 'id'
    }
  },
  share: {
    type: DB.Sequelize.INTEGER,
    allowNull: false,
  },

  difficulty: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
  },

  blockHeight: {
    type: DB.Sequelize.BIGINT,
    allowNull: false
  },
  time: {
    type: DB.Sequelize.DATE,
    allowNull: true,
  },
  status: {
    type: DB.Sequelize.SMALLINT,
    allowNull: false,
    defaultValue: 0,
  }
}, {
  paranoid: true,
});


module.exports = ShareModel;
