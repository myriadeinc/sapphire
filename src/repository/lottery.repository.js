'use strict';

const MinerModel = require('src/models/miner.model.js');
const {LotteryDrawModel, MinerLotteryDraws} = require('src/models/lottery.draw.model.js');
const MyriadeCreditModel = require('src/models/credit.model.js');

const Err = require('src/util/error.js').Gameroom;
const logger = require('src/util/logger.js').db;

const DB = require('src/util/db.js');

const LotteryRepository = {

  newDraw: (time, pot=0) => {
    return DB.sequelize.transaction(async (t) => {
      const opened_lottery = await LotteryDrawModel.findOne({
        where: {
          is_active: true,
        },
      });
      if (opened_lottery) {
        await opened_lottery.update({
          is_active: false,
        }, {transaction: t});
      }
      return LotteryDrawModel.create({
        pot,
        draw_time: time,
        is_active: true,
      }, {transaction: t});
    });
  },

  addMinerToDraw: (minerId, mc_amount) => {
    return DB.sequelize.transaction(async (t) => {
      const available_credits = await MyriadeCreditModel.findAll({
        where: {minerId},
        order: [['time', 'DESC']],
        limit: 1,
      });

      if (0 >= available_credits.length || available_credits[0] < mc_amount) {
        throw new Err('Insufficient fund');
      }
      const updated_amount = Number(available_credits[0].credit) - mc_amount;

      await MyriadeCreditModel.create({
        minerId,
        credit: updated_amount,
        time: Date.now(),
      }, {transaction: t});

      const draw = await LotteryDrawModel.findOne({
        where: {
          is_active: true,
        },
      });
      if (!draw) {
        throw new Err('No active lottery draw');
      }
      await MinerLotteryDraws.create({
        minerId,
        drawId: draw.id,
      }, {transaction: t});
      return draw.update({
        pot: draw.pot + mc_amount,
      }, {transaction: t});
    });
  },

  getCurrentDraw: () => {
    return LotteryDrawModel.findOne({
      where: {
        is_active: true,
      },
    });
  },

};

module.exports = LotteryRepository;
