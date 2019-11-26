'use strict';

const MinerRepository = require('src/repository/miner.repository.js');

const axios = require('axios');

const mq = require('src/util/mq.js');

const logger = require('src/util/logger.js').core;


const MinerMetricsService = {

  convertShareToHashrate: (shares, difficulty, timestamp, minerId) => {
    return 100;
  },

  computeAward: (miner_hashrate, network_hashrate, block_reward) => {
    return (miner_hashrate / network_hashrate) * 0.9 * (10**7) * block_reward;
  },

  processData: async (data) => {
    try {
      const minerId = await MinerRepository.getMiner(data.minerId);

      await MinerRepository.updateShares({
        minerId: miner,
        shares: data.shares,
        difficulty: data.difficulty,
        time: data.timestamp});

      if (data.jackpot) {

      }
    } catch (err) {
      logger.error(err);
    }
  },

  init: () => {
    return mq.registerConsumer(MinerMetricsService.processData);
  },
};

module.exports = MinerMetricsService;
