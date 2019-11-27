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

    const now = Date.now();

    const miners = await MinerRepository.getAllMiners();
    let poolHashrate = 0;

    // Need to wrap all of it inside a DB transaction so that if one fails, all fails and DB
    //  performs a rollback to initial state. This provides strong guarantuee.
    await DB.sequelize.transaction(async (t) => {
      await Promise.all(miners.map( async (miner) => {

        let minerShares = await MinerRepository.getUncalculatedShares(miner.id);
        const last = minerShares[minerShares.length -1].time;
        let minerHashrate = _.reduce(minerShares, (acc, share) => {
          return acc + ( (share.share * share.difficulty) / (now - last) );
        }, 0);
        
        // Updating Miner Hashrate
        await HashRateModel.create({
          minerId: miner.id,
          rate: minerHashrate,
          time: now,
        }, {transaction: t});
        
        // Updates every shares to be is_calculated
        await Promise.all(minerShares.map(share => {
          return share.update({
            is_calculated: true
          }, {transaction: t});
        }))
        poolHashrate += minerHashrate;

      }));
    });
    return poolHashrate;
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
