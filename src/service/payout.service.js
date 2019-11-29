'use strict';
const axios = require('axios');

const MinerRepository = require('src/repository/miner.repository.js');
const moneroApi = require('src/api/monero.api.js');

const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");


const PayOutService = {
    getBaseBlockreward: () => {
      // Hard-coded until ~Jan 2020 but actual base block reward is calculated from formula
        return 2;
    },


    actionPayout: async (blockHeight) => {
    const now = Date.now();
    const miners = await MinerRepository.getAllMiners();
    let poolHashrate = 0;
    // Need to wrap all of it inside a DB transaction so that if one fails, all fails and DB
    //  performs a rollback to initial state. This provides strong guarantuee.
    await DB.sequelize.transaction(async (t) => {
      await Promise.all(miners.map( async (miner) => {
        let minerShares = await MinerRepository.getBlockShares(miner.id,blockHeight);
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
        
        poolHashrate += minerHashrate;

        await CreditModel.create({
          minerID: miner.id,
          time: now,
          credit: this.constantPayout(minerHashrate,blockHeight)
        }), {transaction: t};
      }));
    });

    },

    constantPayout: async (minerHashrate,blockHeight,useBaseReward=false) => {
      let networkHashRate = await moneroApi.getNetworkHashrate(blockHeight);
      let fullBlockReward = await moneroApi.getFullBlockReward(blockHeight);

      if(baseReward){
        let getBaseBlockreward = await moneroApi.getBaseBlockReward(blockHeight);
        let credits = 10**7n * BigInt(baseBlockReward) * BigInt(minerHashrate/networkHashRate);
        return credits;
      }
      let credits = 10**7n * BigInt(fullBlockReward) * BigInt(minerHashrate/networkHashRate);
      
      return credits;


    }
}

module.exports = PayOutService;