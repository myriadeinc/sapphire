'use strict';

const DB = require('src/util/db.js');


const MinerModel = require('src/models/miner.model.js');

const LotteryDrawModel = DB.sequelize.define('LotteryDraws', {
  id: {
    type: DB.Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },

  pot: {
    type: DB.Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },

  draw_time: {
    type: DB.Sequelize.DATE,
    allowNull: false,
  },

  is_active: {
    type: DB.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },

}, {
  paranoid: true,
});

const MinerLotteryDraws = DB.sequelize.define('MinerLotteryDraws', {
  id: {
    type: DB.Sequelize.BIGINT,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  minerId: {
    type: DB.Sequelize.UUID,
  },
  drawId: {
    type: DB.Sequelize.BIGINT,
  },
}, {
  paranoid: true,
});

MinerModel.belongsToMany(LotteryDrawModel, {
  through: MinerLotteryDraws,
  as: 'draws',
  foreignKey: 'minerId',
  otherKey: 'drawId',
});

LotteryDrawModel.belongsToMany(MinerModel, {
  through: MinerLotteryDraws,
  as: 'miners',
  foreignKey: 'drawId',
  otherKey: 'minerId',
});

module.exports = {LotteryDrawModel, MinerLotteryDraws};
