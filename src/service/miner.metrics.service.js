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
      
      if(data.jackpot){
        this.calculateShares();
      }
      
    } catch (err) {
      logger.error(err);
    }
  },

  calculateShares: async () => {
    const allShares = MinerRepository.getMinerShares();
    let now = Date.now();
    /**
     * multiply shares*difficulty
     * sum by minerId
     * divide by timeInterval
     * 
     * sum all minerId hashrates to get pool hashrate
     * 
     */
    allShares.map(function(minerId, startTime, difficulty, shares) {
      const timeInterval = now - startTime;
      



    });



  },
  init: () => {
    return mq.registerConsumer(MinerMetricsService.processData);
  },
};

module.exports = MinerMetricsService;
