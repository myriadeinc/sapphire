'use strict';

const MinerRepository = require('src/repository/miner.repository.js');

const axios = require('axios');

const mq = require('src/util/mq.js');

const logger = require('src/util/logger.js').core;


const MinerMetricsService = {

  getMoneroStats: () => {
    return axios({
      url: 'http://moneroblocks.info/api/get_stats/',
      method: 'get',
    })
        .then(({data}) => {
          return data;
        });
  },

  convertShareToHashrate: (shares, difficulty, timestamp, minerId) => {
    return 100;
  },

  computeAward: (miner_hashrate, network_hashrate, block_reward) => {
    return (miner_hashrate / network_hashrate) * 0.9 * (10**7) * block_reward;
  },

  processData: async (data) => {
    try {
      const miner = await MinerRepository.getMiner(data.minerId);
      const miner_hashrate = MinerMetricsService.convertShareToHashrate(data.shares, data.difficulty, data.timestamp, data.minerId);
      const monero_stats = MinerMetricsService.getMoneroStats();
      const network_hashrate = monero_stats.hashrate;
      const block_reward = monero_stats.last_reward;
      await MinerRepository.updateHashrate({
        minerId: miner.id,
        rate: hashrate,
        time: data.timestamp,
      });
      new_myriade_credits = MinerMetricsService.computeAward(miner_hashrate, network_hashrate, block_reward);
      if (new_myriade_credits > 0) {
        await MinerRepository.updateMiner({
          minerId: miner.id,
          data: {
            myriade_credits: miner.myriade_credits + new_myriade_credits,
          },
        });
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
