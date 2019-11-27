'use strict';

const LotteryRepository = require('src/repository/lottery.repository.js');
const LotteryDrawModel = require('src/models/lottery.draw.model.js');

const cron = require('node-cron');
const logger = require('src/util/logger.js').job;

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

Date.prototype.addHours= function(h) {
  this.setHours(this.getHours()+h);
  return this;
};

let lastWinner = null;

const LotteryService = {

  getLastWinner: () => {
    return lastWinner ? lastWinner : '';
  },

  init: () => {
    cron.schedule('00 00 */1 * * * *', async () => {
      logger.info('Performing a lottery draw');
      LotteryService.tick(new Date().addHours(1))
          .then((nextDraw) => {
            logger.info('Successful job: Lottery Draw');
            logger.info(`Next draw is at ${nextDraw.draw_time}`);
          })
          .catch((err) => {
            logger.error(`Failed job: Lottery Draw due to ${err}`);
          });
    }, {
      scheduled: true,
    });
  },

  tick: async (next_draw_time) => {
    // Upon webhook call to perform a draw
    lastWinner = await LotteryService.performDraw();
    return LotteryRepository.newDraw(next_draw_time);
  },

  performDraw: async () => {
    const currentDraw = await LotteryRepository.getCurrentDraw();
    if (!currentDraw) {
      return;
    }
    const participants = await currentDraw.getMiners();

    const winner_idx = getRandomInt(participants.length);

    const winner = participants[winner_idx];
    await winner.update({
      monero_balance: winner.monero_balance + currentDraw.pot,
    });
    logger.info(` Winner is ${winner.id} `);
    return winner.id;
  },
};

module.exports = LotteryService;
