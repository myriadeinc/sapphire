'use strict';

const MinerRepository = require('src/repository/miner.repository.js');

const mq = require('src/util/mq.js');

const logger = require('src/util/logger.js').core;

const BLOCK_REWARD = 0.3;

const MinerMetricsService = {

  convertShareToHashrate: (shares, difficulty, timestamp, minerId) => {
    return 100;
  },

  computeAward: (hashrate, network_hashrate) => {
    return (hashrate / network_hashrate) * 0.9 * (10**7) * BLOCK_REWARD;s
  },

  processData: async (data) => {
    try{
      let miner = await MinerRepository.getMiner(data.minerId);
      let hashrate = MinerMetricsService.convertShareToHashrate(data.shares, data.difficulty, data.timestamp, data.minerId);
      let network_hashrate = 100; // Change this
      await MinerRepository.updateHashrate({
        minerId: miner.id,
        rate: hashrate,
        time: data.timestamp
      })
      new_myriade_credits = MinerMetricsService.computeAward(hashrate, network_hashrate);
      if (new_myriade_credits > 0){
        await MinerRepository.updateMiner({
          minerId: miner.id,
          data: {
            myriade_credits: miner.myriade_credits + new_myriade_credits
          }
        })
      }
    }
    catch(err){
      logger.error(err);
    }
  },

  init: () => {
    return mq.registerConsumer(MinerMetricsService.processData)
  }
}

module.exports = MinerMetricsService;