'use strict';
const testing = require('../test.init.js');
const { LotteryDrawModel, MinerLotteryDraws } = require('src/models/lottery.draw.model.js');


const LotteryHelper = {

  createActiveDraw: () => {
    return LotteryDrawModel.create({
      pot: 100,
      draw_time: Date.now(),
      is_active: true
    })
  },

  createInactiveDraw: () => {
    return LotteryDrawModel.create({
      pot: 50,
      draw_time: Date.now() - 200,
      is_active: false
    })
  },

  deleteDraws: () => {
    return MinerLotteryDraws.destroy({
      truncate: true,
      cascade: true,
      force: true
    })
    .then(() => {
      return LotteryDrawModel.destroy({
        truncate: true,
        cascade: true,
        force: true
      })
    })
  }

}

module.exports = LotteryHelper;