'use strict';

const LotteryRepository = require('src/repository/lottery.repository.js');
const LotteryDrawModel = require('src/models/lottery.draw.model.js');

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

let lastWinner = null;

const LotteryService = {

  getLastWinner: () => {
    return lastWinner ? lastWinner : '';
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

    return winner.id;
  },
};

module.exports = LotteryService;
