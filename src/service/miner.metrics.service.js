'use strict';

const MinerRepository = require('src/repository/miner.repository.js');

const axios = require('axios');

const mq = require('src/util/mq.js');

const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");

const MinerMetricsService = {

  convertShareToHashrate: (shares, difficulty, timestamp, minerId) => {
    return 100;
  },

  computeAward: (miner_hashrate, network_hashrate, block_reward) => {
    return (miner_hashrate / network_hashrate) * 0.9 * (10**7) * block_reward;
  },

  processData: async (data) => {
    try {
      //const miner = await MinerRepository.getMiner(data.minerId);

      await MinerRepository.insertShare({
        minerId: data.minerId,
        shares: data.shares,
        difficulty: data.difficulty,
        time: data.timestamp
      });

      if (data.jackpot) {
        await MinerMetricsService.calculateHashrates();
        await MinerMetricsService.calculateRewards();
      }
    } catch (err) {
      logger.error(err);
    }
  },

  calculateHashrates: async () => {

  },

  calculateRewards: async(totalReward, poolHashrate) => {
    // Iterate through all the latest hashrates, for each miner, then compute the ratio for 
    //  accrediting MC and save their new MC balance using MinerRepository.updateCredit

    
  },
  init: () => {
    return mq.registerConsumer(MinerMetricsService.processData);
  },
};

module.exports = MinerMetricsService;
